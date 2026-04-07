import 'package:flutter/material.dart';
import '../main.dart' show AppColors;

class KycRegistrationScreen extends StatelessWidget {
  const KycRegistrationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Rider Registration',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 18,
            color: Color(0xFF0F172A),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Submit your documents to start earning.',
                style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
              ),
              const SizedBox(height: 32),

              _buildStepCard(
                title: 'Personal Information',
                subtitle: 'Name, Phone, Address',
                icon: Icons.person_outline,
                isCompleted: true,
              ),
              const SizedBox(height: 16),

              _buildStepCard(
                title: 'Vehicle Details',
                subtitle: 'License Plate, Model, Type',
                icon: Icons.two_wheeler,
                isCompleted: false,
              ),
              const SizedBox(height: 16),

              _buildStepCard(
                title: 'Driver License',
                subtitle: 'Upload photo of your license',
                icon: Icons.badge_outlined,
                isCompleted: false,
              ),
              const SizedBox(height: 16),

              _buildStepCard(
                title: 'Identity Verification (KYC)',
                subtitle: 'Selfie with National ID Card',
                icon: Icons.face_retouching_natural,
                isCompleted: false,
              ),
              const SizedBox(height: 48),

              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Submit Application',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isCompleted,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isCompleted ? const Color(0xFFF0FDF4) : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isCompleted
              ? Colors.green.withOpacity(0.5)
              : const Color(0xFFE2E8F0),
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: isCompleted
              ? Colors.green
              : AppColors.primaryLight,
          child: Icon(
            isCompleted ? Icons.check : icon,
            color: isCompleted ? Colors.white : AppColors.primary,
          ),
        ),
        title: Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
            color: Color(0xFF0F172A),
          ),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
        ),
        trailing: const Icon(
          Icons.arrow_forward_ios,
          size: 16,
          color: Color(0xFFCBD5E1),
        ),
      ),
    );
  }
}
