import 'dart:convert';
import 'dart:io';
import 'dart:async'; // Added for Timer
import 'package:flutter/material.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Express Rider',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamily: 'Inter',
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        useMaterial3: true,
      ),
      home: const RiderHomePage(),
    );
  }
}

class RiderHomePage extends StatefulWidget {
  const RiderHomePage({super.key});

  @override
  State<RiderHomePage> createState() => _RiderHomePageState();
}

class _RiderHomePageState extends State<RiderHomePage> {
  WebSocketChannel? _channel;
  bool _isOnline = false;
  List<String> _logs = [];
  final ImagePicker _picker = ImagePicker();
  Timer? _locationTimer; // Timer for location updates

  // Active Job State
  String? _currentOrderId;
  String? _availableOrderId; // New order waiting to be accepted
  String _jobStatus = 'idle';

  @override
  void dispose() {
    _locationTimer?.cancel();
    _channel?.sink.close();
    super.dispose();
  }

  void _toggleOnline() {
    setState(() {
      if (_isOnline) {
        _channel?.sink.close();
        _isOnline = false;
        _logs.add("🔴 Offline");
      } else {
        _connectWebSocket();
      }
    });
  }

  void _connectWebSocket() {
    try {
      _channel = WebSocketChannel.connect(Uri.parse('ws://localhost:8083/ws'));
      _isOnline = true;
      _logs.add("🟢 Online - Connected to Gateway");

      _channel!.stream.listen(
        (message) {
          _handleMessage(message);
        },
        onError: (error) {
          setState(() {
            _logs.add("❌ Error: $error");
            _isOnline = false;
          });
        },
        onDone: () {
          setState(() {
            _logs.add("🔌 Disconnected");
            _isOnline = false;
          });
        },
      );
    } catch (e) {
      setState(() {
        _logs.add("❌ Connection failed: $e");
      });
    }
  }

  void _handleMessage(String message) {
    try {
      final data = jsonDecode(message);
      setState(() {
        _logs.add("📩 ${data['type']}");
      });

      if (data['type'] == 'ORDER_CREATED') {
        final orderId = data['data']['id'];
        setState(() {
          _availableOrderId = orderId;
          _logs.add("🆕 New Order Available: $orderId");
        });
        // Show popup
        _showAcceptJobDialog(orderId, data['data']);
      } else if (data['type'] == 'ORDER_ACCEPTED') {
        setState(() {
          _currentOrderId = data['order_id'];
          _jobStatus = 'matched';
          _availableOrderId = null;
          _logs.add("✅ Job Accepted: $_currentOrderId");
        });
      } else if (data['type'] == 'ORDER_ARRIVED_PICKUP') {
        setState(() {
          _jobStatus = 'arrived_pickup';
          _logs.add("📍 Arrived at Pickup");
        });
      } else if (data['type'] == 'ORDER_PICKED_UP') {
        setState(() {
          _jobStatus = 'picked_up';
          _logs.add("📦 Parcel Picked Up");
        });
      } else if (data['type'] == 'ORDER_ARRIVED_DROPOFF') {
        setState(() {
          _jobStatus = 'arrived_dropoff';
          _logs.add("📍 Arrived at Dropoff");
        });
      } else if (data['type'] == 'ORDER_DELIVERED') {
        setState(() {
          _jobStatus = 'delivered';
          _logs.add("✅ Parcel Delivered");
        });
      } else if (data['type'] == 'ORDER_COMPLETED') {
        setState(() {
          _jobStatus = 'completed';
          _logs.add("💰 Payment Confirmed - Job Complete");
          _stopLocationSharing(); // Stop sharing location
        });
      }
    } catch (e) {
      setState(() {
        _logs.add("⚠️ Parse error: $e");
      });
    }
  }

  void _showAcceptJobDialog(String orderId, Map<String, dynamic> orderData) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('🚚 New Delivery Job'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Order ID: $orderId',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'Pickup: ${orderData['pickup_address']?['address'] ?? 'N/A'}',
              ),
              Text(
                'Delivery: ${orderData['delivery_address']?['address'] ?? 'N/A'}',
              ),
              const SizedBox(height: 8),
              Text(
                'Price: ฿${orderData['total_price'] ?? '0'}',
                style: const TextStyle(
                  color: Colors.green,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                setState(() {
                  _availableOrderId = null;
                });
                Navigator.of(context).pop();
              },
              child: const Text('Decline'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                _acceptJob(orderId);
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.teal),
              child: const Text('Accept Job'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _acceptJob(String orderId) async {
    try {
      final response = await http.post(
        Uri.parse('http://localhost:8082/api/v1/orders/$orderId/accept'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'rider_id': '00000000-0000-0000-0000-000000000001',
        }), // Valid UUID for POC
      );

      if (response.statusCode == 200) {
        setState(() {
          _currentOrderId = orderId;
          _jobStatus = 'matched';
          _availableOrderId = null;
          _logs.add("✅ Job Accepted Successfully");
          _startLocationSharing(); // Start sharing location
        });
      } else {
        setState(() {
          _logs.add("❌ Accept Failed: ${response.statusCode}");
        });
      }
    } catch (e) {
      setState(() {
        _logs.add("❌ Accept Error: $e");
      });
    }
  }

  Future<void> _callAPI(String endpoint, {String? photoUrl}) async {
    if (_currentOrderId == null) return;

    try {
      final body = photoUrl != null
          ? jsonEncode({"photo_url": photoUrl})
          : null;
      final response = await http.post(
        Uri.parse(
          'http://localhost:8082/api/v1/orders/$_currentOrderId/$endpoint',
        ),
        headers: {'Content-Type': 'application/json'},
        body: body,
      );

      if (response.statusCode == 200) {
        setState(() {
          _logs.add("✅ API Success: $endpoint");
        });
      } else {
        setState(() {
          _logs.add("❌ API Error: ${response.statusCode}");
        });
      }
    } catch (e) {
      setState(() {
        _logs.add("❌ API Failed: $e");
      });
    }
  }

  Future<String?> _takePhotoAndUpload() async {
    // MOCK VERSION - Skip camera and use placeholder
    setState(() {
      _logs.add("📷 Using mock photo (camera skipped)");
    });

    // Generate mock photo URL
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final mockPhotoUrl =
        "http://localhost:8082/uploads/mock_photo_$timestamp.jpg";

    setState(() {
      _logs.add("✅ Mock photo: $mockPhotoUrl");
    });

    return mockPhotoUrl;

    /* REAL VERSION - Uncomment when camera works
    try {
      final XFile? photo = await _picker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (photo == null) {
        setState(() {
          _logs.add("📷 Photo cancelled");
        });
        return null;
      }

      setState(() {
        _logs.add("📤 Uploading photo...");
      });

      var request = http.MultipartRequest(
        'POST',
        Uri.parse('http://localhost:8082/upload'),
      );
      request.files.add(await http.MultipartFile.fromPath('image', photo.path));

      var response = await request.send();
      if (response.statusCode == 200) {
        final responseData = await response.stream.bytesToString();
        final jsonData = jsonDecode(responseData);
        final photoUrl = jsonData['url'];

        setState(() {
          _logs.add("✅ Photo uploaded: $photoUrl");
        });
        return photoUrl;
      } else {
        setState(() {
          _logs.add("❌ Upload failed: ${response.statusCode}");
        });
        return null;
      }
    } catch (e) {
      setState(() {
        _logs.add("❌ Photo error: $e");
      });
      return null;
    }
    */
  }

  Future<void> _handlePickupWithPhoto() async {
    final photoUrl = await _takePhotoAndUpload();
    if (photoUrl != null) {
      await _callAPI('pickup', photoUrl: photoUrl);
    }
  }

  Future<void> _handleDeliveryWithPhoto() async {
    final photoUrl = await _takePhotoAndUpload();
    if (photoUrl != null) {
      await _callAPI('deliver', photoUrl: photoUrl);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Express Rider App'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        actions: [
          Switch(
            value: _isOnline,
            onChanged: (value) => _toggleOnline(),
            activeColor: Colors.white,
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: Column(
        children: [
          // Status Bar
          Container(
            padding: const EdgeInsets.all(16),
            color: _isOnline ? Colors.green.shade100 : Colors.grey.shade200,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _isOnline ? '🟢 Online' : '🔴 Offline',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Status: ${_jobStatus.toUpperCase()}',
                  style: const TextStyle(fontSize: 14),
                ),
              ],
            ),
          ),

          // Active Job Card
          if (_currentOrderId != null) _buildActiveJobCard(),

          // Logs
          Expanded(
            child: Container(
              color: Colors.grey.shade50,
              child: ListView.builder(
                reverse: true,
                itemCount: _logs.length,
                itemBuilder: (context, index) {
                  final log = _logs[_logs.length - 1 - index];
                  return ListTile(
                    dense: true,
                    title: Text(
                      log,
                      style: const TextStyle(
                        fontSize: 12,
                        fontFamily: 'monospace',
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveJobCard() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Active Job: $_currentOrderId',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),

          if (_jobStatus == 'matched')
            _buildActionButton(
              "Arrived at Pickup",
              Icons.pin_drop,
              Colors.blue,
              'arrived-pickup',
            ),

          if (_jobStatus == 'arrived_pickup')
            _buildPhotoButton(
              "Confirm Pickup & Photo",
              Icons.camera_alt,
              Colors.purple,
              _handlePickupWithPhoto,
            ),

          if (_jobStatus == 'picked_up')
            _buildActionButton(
              "Arrived at Dropoff",
              Icons.flag,
              Colors.blue,
              'arrived-dropoff',
            ),

          if (_jobStatus == 'arrived_dropoff')
            _buildPhotoButton(
              "Confirm Delivery & Photo",
              Icons.camera_alt,
              Colors.green,
              _handleDeliveryWithPhoto,
            ),

          if (_jobStatus == 'delivered')
            Column(
              children: [
                const Text(
                  "Collect Payment Handling",
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 10),
                _buildActionButton(
                  "Confirm Payment Received",
                  Icons.attach_money,
                  Colors.teal,
                  'confirm-payment',
                ),
              ],
            ),

          if (_jobStatus == 'completed')
            const Text(
              "✅ Job Completed!",
              style: TextStyle(
                color: Colors.green,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildActionButton(
    String label,
    IconData icon,
    Color color,
    String endpoint,
  ) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: () => _callAPI(endpoint),
        icon: Icon(icon),
        label: Text(label),
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }

  Widget _buildPhotoButton(
    String label,
    IconData icon,
    Color color,
    Future<void> Function() onPressed,
  ) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: onPressed,
        icon: Icon(icon),
        label: Text(label),
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }

  void _startLocationSharing() {
    _locationTimer?.cancel();
    _locationTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (_currentOrderId == null || !_isOnline) {
        timer.cancel();
        return;
      }
      // Mock Location Movement (Siam Paragon area)
      final lat = 13.7462 + (timer.tick * 0.0001);
      final lng = 100.5348 + (timer.tick * 0.0001);

      final msg = jsonEncode({
        "type": "LOCATION_UPDATE",
        "order_id":
            _currentOrderId, // Ensure this matches what receiver expects
        "rider_id": "00000000-0000-0000-0000-000000000001",
        "lat": lat,
        "lng": lng,
      });

      _channel?.sink.add(msg);
      // Log occasionally
      if (timer.tick % 5 == 0) {
        setState(() {
          _logs.add("📡 Sent Location: $lat, $lng");
        });
      }
    });

    setState(() {
      _logs.add("📡 Location Sharing Started");
    });
  }

  void _stopLocationSharing() {
    _locationTimer?.cancel();
    _locationTimer = null;
    setState(() {
      _logs.add("🛑 Location Sharing Stopped");
    });
  }
}
