import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'widgets/map_placeholder.dart' show LatLng, RiderMap, MapPlaceholder;
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:http/http.dart' as http;
import '../models/rider.dart';
import '../main.dart' show AppColors;
import 'active_job_screen.dart';
import 'completion_screen.dart';


class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  WebSocketChannel? _channel;
  bool _isOnline = false;
  Timer? _locationTimer;

  // State
  double _walletBalance = Rider.mock.walletBalance;
  List<Map<String, dynamic>> _availableJobs = [];
  String? _currentOrderId;
  String _jobStatus = 'idle';
  double _riderLat = Rider.mock.lat;
  double _riderLng = Rider.mock.lng;

  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _locationTimer?.cancel();
    _channel?.sink.close();
    super.dispose();
  }

  void _toggleOnline() {
    setState(() {
      if (_isOnline) {
        _channel?.sink.close();
        _isOnline = false;
        _availableJobs.clear();
      } else {
        _connectWebSocket();
      }
    });
  }

  void _connectWebSocket() {
    try {
      _channel = WebSocketChannel.connect(Uri.parse('ws://localhost:8083/ws'));
      _isOnline = true;

      _channel!.stream.listen(
        (message) {
          _handleMessage(message);
        },
        onError: (error) {
          setState(() {
            _isOnline = false;
          });
        },
        onDone: () {
          setState(() {
            _isOnline = false;
          });
        },
      );
    } catch (e) {
      // Ignored for UI
    }
  }

  void _handleMessage(String message) {
    try {
      final data = jsonDecode(message);
      if (data['type'] == 'ORDER_CREATED') {
        setState(() {
          _availableJobs.add(data['data']);
        });
      } else if (data['type'] == 'ORDER_ACCEPTED') {
        setState(() {
          _currentOrderId = data['order_id'];
          _jobStatus = 'matched';
          _availableJobs.removeWhere((job) => job['id'] == _currentOrderId);
        });
        _startLocationSharing();
      } else if (data['type'] == 'LOCATION_UPDATE') {
        setState(() {
          _riderLat = (data['lat'] as num).toDouble();
          _riderLng = (data['lng'] as num).toDouble();
        });
      } else if (data['type'] == 'ORDER_ARRIVED_PICKUP') {
        setState(() => _jobStatus = 'arrived_pickup');
      } else if (data['type'] == 'ORDER_PICKED_UP') {
        setState(() => _jobStatus = 'picked_up');
      } else if (data['type'] == 'ORDER_ARRIVED_DROPOFF') {
        setState(() => _jobStatus = 'arrived_dropoff');
      } else if (data['type'] == 'ORDER_DELIVERED') {
        setState(() => _jobStatus = 'delivered');
        _callAPI('confirm-payment'); // Auto confirm for POC
      } else if (data['type'] == 'ORDER_COMPLETED') {
        setState(() => _jobStatus = 'completed');
        _stopLocationSharing();

        final earnings = 120.00; // Mock earnings from job
        _walletBalance += earnings; // Update balance locally

        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => CompletionScreen(
              earnings: earnings,
              newBalance: _walletBalance,
              onReturnHome: () {
                Navigator.of(context).pop();
                setState(() {
                  _currentOrderId = null;
                  _jobStatus = 'idle';
                });
              },
            ),
          ),
        );
      }
    } catch (e) {
      // ignored
    }
  }

  Future<void> _acceptJob(String orderId) async {
    try {
      final response = await http.post(
        Uri.parse('http://localhost:8082/api/v1/orders/$orderId/accept'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'rider_id': Rider.mock.id}),
      );

      if (response.statusCode == 200) {
        setState(() {
          _currentOrderId = orderId;
          _jobStatus = 'matched';
          _availableJobs.removeWhere((job) => job['id'] == orderId);
          _startLocationSharing();
        });
      }
    } catch (e) {
      // ignored
    }
  }

  Future<void> _callAPI(String endpoint, {String? photoUrl}) async {
    if (_currentOrderId == null) return;
    try {
      final body = photoUrl != null
          ? jsonEncode({"photo_url": photoUrl})
          : null;
      await http.post(
        Uri.parse(
          'http://localhost:8082/api/v1/orders/$_currentOrderId/$endpoint',
        ),
        headers: {'Content-Type': 'application/json'},
        body: body,
      );
    } catch (e) {
      // ignored
    }
  }

  Future<String> _mockPhotoUpload() async {
    await Future.delayed(const Duration(seconds: 1)); // simulate upload time
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    return "http://localhost:8082/uploads/mock_photo_$timestamp.jpg";
  }

  Future<void> _handleAction(
    String endpoint, {
    bool requirePhoto = false,
  }) async {
    if (requirePhoto) {
      final photoUrl = await _mockPhotoUpload();
      await _callAPI(endpoint, photoUrl: photoUrl);
    } else {
      await _callAPI(endpoint);
    }
  }

  void _startLocationSharing() {
    _locationTimer?.cancel();
    _locationTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (_currentOrderId == null || !_isOnline) {
        timer.cancel();
        return;
      }
      final lat = Rider.mock.lat + (timer.tick * 0.0001);
      final lng = Rider.mock.lng + (timer.tick * 0.0001);

      final msg = jsonEncode({
        "type": "LOCATION_UPDATE",
        "order_id": _currentOrderId,
        "rider_id": Rider.mock.id,
        "lat": lat,
        "lng": lng,
      });
      _channel?.sink.add(msg);
    });
  }

  void _stopLocationSharing() {
    _locationTimer?.cancel();
    _locationTimer = null;
  }

  @override
  Widget build(BuildContext context) {
    if (_currentOrderId != null) {
      return ActiveJobScreen(
        orderId: _currentOrderId!,
        jobStatus: _jobStatus,
        riderLat: _riderLat,
        riderLng: _riderLng,
        onArrivedPickup: () => _handleAction('arrived-pickup'),
        onPickedUp: () => _handleAction('pickup', requirePhoto: true),
        onArrivedDropoff: () => _handleAction('arrived-dropoff'),
        onDelivered: () => _handleAction('deliver', requirePhoto: true),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Background Map — real Google Map when online, grid when offline
          if (_isOnline)
            RiderMap(
              center: LatLng(_riderLat, _riderLng),
              riderPosition: LatLng(_riderLat, _riderLng),
            )
          else
            MapPlaceholder(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Icon(
                      Icons.location_off,
                      size: 48,
                      color: Color(0xFFCBD5E1),
                    ),
                    SizedBox(height: 12),
                    Text(
                      'You are currently offline',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Pulsing rider dot overlay (only when online)
          if (_isOnline)
            Center(
              child: Stack(
                alignment: Alignment.center,
                children: [
                  FadeTransition(
                    opacity: _pulseController,
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: const BoxDecoration(
                        color: Color(0x1A3960ED),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 3),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.35),
                          blurRadius: 12,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.two_wheeler,
                      color: Colors.white,
                      size: 18,
                    ),
                  ),
                ],
              ),
            ),

          // Header
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 16.0,
                vertical: 8.0,
              ),
              child: Row(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(4),
                    child: Row(
                      children: [
                        CircleAvatar(
                          backgroundImage: NetworkImage(Rider.mock.avatar),
                          radius: 20,
                        ),
                        const SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              '฿${_walletBalance.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 14,
                              ),
                            ),
                            const Text(
                              'Wallet Balance',
                              style: TextStyle(
                                fontSize: 10,
                                color: Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(width: 16),
                      ],
                    ),
                  ),
                  const Spacer(),
                  // Toggle Button
                  GestureDetector(
                    onTap: _toggleOnline,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: _isOnline ? AppColors.primary : Colors.white,
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.power_settings_new,
                            size: 18,
                            color: _isOnline
                                ? Colors.white
                                : const Color(0xFF94A3B8),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _isOnline ? 'ONLINE' : 'GO ONLINE',
                            style: TextStyle(
                              color: _isOnline
                                  ? Colors.white
                                  : const Color(0xFF0F172A),
                              fontWeight: FontWeight.w900,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Incoming Jobs Popup Overlay
          if (_isOnline && _availableJobs.isNotEmpty)
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.only(
                  top: 24,
                  left: 24,
                  right: 24,
                  bottom: 40,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(32),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 20,
                      offset: const Offset(0, -5),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE2E8F0),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.notifications_active,
                          color: AppColors.primary,
                        ),
                        SizedBox(width: 10),
                        Text(
                          'NEW JOB REQUEST',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            color: AppColors.primary,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 240,
                      child: PageView.builder(
                        itemCount: _availableJobs.length,
                        physics: const BouncingScrollPhysics(),
                        itemBuilder: (context, index) {
                          final job = _availableJobs[index];
                          return Card(
                            elevation: 0,
                            color: const Color(0xFFF8FAFC),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                              side: const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(20.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 10,
                                          vertical: 4,
                                        ),
                                        decoration: const BoxDecoration(
                                          color: AppColors.primaryLight,
                                          borderRadius: BorderRadius.all(Radius.circular(8)),
                                        ),
                                        child: const Text(
                                          'Express',
                                          style: TextStyle(
                                            color: AppColors.primary,
                                            fontWeight: FontWeight.w800,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ),
                                      Text(
                                        '฿${job['total_price']}',
                                        style: const TextStyle(
                                          fontSize: 24,
                                          fontWeight: FontWeight.w900,
                                          color: Color(0xFF0F172A),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Spacer(),
                                  Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Icon(
                                        Icons.location_on,
                                        color: AppColors.primary,
                                        size: 20,
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              'Pickup',
                                              style: TextStyle(
                                                fontSize: 10,
                                                color: Color(0xFF64748B),
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            Text(
                                              job['pickup_address']?['address'] ??
                                                  'Unknown',
                                              style: const TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w700,
                                                color: Color(0xFF1E293B),
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Icon(
                                        Icons.flag,
                                        color: Colors.green,
                                        size: 20,
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              'Drop-off',
                                              style: TextStyle(
                                                fontSize: 10,
                                                color: Color(0xFF64748B),
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            Text(
                                              job['delivery_address']?['address'] ??
                                                  'Unknown',
                                              style: const TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w700,
                                                color: Color(0xFF1E293B),
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Spacer(),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: TextButton(
                                          onPressed: () {
                                            setState(() {
                                              _availableJobs.remove(job);
                                            });
                                          },
                                          style: TextButton.styleFrom(
                                            padding: const EdgeInsets.symmetric(
                                              vertical: 16,
                                            ),
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(16),
                                            ),
                                          ),
                                          child: const Text(
                                            'Ignore',
                                            style: TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF64748B),
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: ElevatedButton(
                                          onPressed: () =>
                                              _acceptJob(job['id']),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: AppColors.primary,
                                            foregroundColor: Colors.white,
                                            elevation: 0,
                                            padding: const EdgeInsets.symmetric(
                                              vertical: 16,
                                            ),
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(16),
                                            ),
                                          ),
                                          child: const Text(
                                            'Accept',
                                            style: TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
