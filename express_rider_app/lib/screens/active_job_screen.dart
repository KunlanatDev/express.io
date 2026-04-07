import 'package:flutter/material.dart';
import 'widgets/map_placeholder.dart' show LatLng, RiderMap;
import '../main.dart' show AppColors;


class ActiveJobScreen extends StatelessWidget {
  final String orderId;
  final String jobStatus;
  final VoidCallback onArrivedPickup;
  final VoidCallback onPickedUp;
  final VoidCallback onArrivedDropoff;
  final VoidCallback onDelivered;
  // Real map positions (optional — used when available)
  final double? riderLat;
  final double? riderLng;
  final double? pickupLat;
  final double? pickupLng;
  final double? dropoffLat;
  final double? dropoffLng;

  const ActiveJobScreen({
    super.key,
    required this.orderId,
    required this.jobStatus,
    required this.onArrivedPickup,
    required this.onPickedUp,
    required this.onArrivedDropoff,
    required this.onDelivered,
    this.riderLat,
    this.riderLng,
    this.pickupLat,
    this.pickupLng,
    this.dropoffLat,
    this.dropoffLng,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Stack(
        children: [
          // Background Map
          _buildMap(),

          SafeArea(
            child: Column(
              children: [
                // Top Warning/Info bar
                Container(
                  margin: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'JOB ID',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF94A3B8),
                            ),
                          ),
                          Text(
                            orderId.substring(0, 8).toUpperCase(),
                            style: const TextStyle(
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _getStatusText(jobStatus).toUpperCase(),
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w800,
                            fontSize: 10,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),

                // Bottom Actions Card
                Container(
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
                  padding: const EdgeInsets.only(
                    top: 24,
                    left: 24,
                    right: 24,
                    bottom: 40,
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

                      // Customer Info
                      Row(
                        children: [
                          Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.person,
                              color: Color(0xFF64748B),
                            ),
                          ),
                          const SizedBox(width: 16),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Somchai (Customer)',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 16,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                                Text(
                                  'Cash Collection: ฿0.00',
                                  style: TextStyle(
                                    color: Colors.green,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            onPressed: () {},
                            icon: const Icon(Icons.chat_bubble),
                            color: AppColors.primary,
                            style: IconButton.styleFrom(
                              backgroundColor: AppColors.primaryLight,
                            ),
                          ),
                          const SizedBox(width: 8),
                          IconButton(
                            onPressed: () {},
                            icon: const Icon(Icons.phone),
                            color: Colors.blue,
                            style: IconButton.styleFrom(
                              backgroundColor: Colors.blue.withOpacity(0.1),
                            ),
                          ),
                        ],
                      ),

                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 16.0),
                        child: Divider(color: Color(0xFFE2E8F0)),
                      ),

                      _buildActionButtons(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMap() {
    final center = riderLat != null && riderLng != null
        ? LatLng(riderLat!, riderLng!)
        : pickupLat != null && pickupLng != null
            ? LatLng(pickupLat!, pickupLng!)
            : const LatLng(13.7563, 100.5018);
    return RiderMap(
      center: center,
      riderPosition: riderLat != null && riderLng != null
          ? LatLng(riderLat!, riderLng!)
          : null,
      pickupPosition: pickupLat != null && pickupLng != null
          ? LatLng(pickupLat!, pickupLng!)
          : null,
      dropoffPosition: dropoffLat != null && dropoffLng != null
          ? LatLng(dropoffLat!, dropoffLng!)
          : null,
    );
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'matched':
        return 'Heading to Pickup';
      case 'arrived_pickup':
        return 'At Pickup';
      case 'picked_up':
        return 'Heading to Dropoff';
      case 'arrived_dropoff':
        return 'At Dropoff';
      case 'delivered':
        return 'Processing';
      default:
        return status;
    }
  }

  Widget _buildActionButtons() {
    if (jobStatus == 'matched') {
      return _buildPrimaryAction(
        label: 'Swipe to Arrive at Pickup',
        icon: Icons.storefront,
        color: AppColors.accent,
        onTap: onArrivedPickup,
      );
    } else if (jobStatus == 'arrived_pickup') {
      return _buildPrimaryAction(
        label: 'Scan & Confirm Pickup',
        icon: Icons.qr_code_scanner,
        color: AppColors.primary,
        onTap: onPickedUp,
      );
    } else if (jobStatus == 'picked_up') {
      return _buildPrimaryAction(
        label: 'Swipe to Arrive at Drop-off',
        icon: Icons.flag,
        color: AppColors.accent,
        onTap: onArrivedDropoff,
      );
    } else if (jobStatus == 'arrived_dropoff') {
      return _buildPrimaryAction(
        label: 'Take Photo & Deliver',
        icon: Icons.camera_alt,
        color: Colors.green,
        onTap: onDelivered,
      );
    } else {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }
  }

  Widget _buildPrimaryAction({
    required String label,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [color, color.withOpacity(0.85)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.4),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white),
            const SizedBox(width: 12),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                fontSize: 16,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
