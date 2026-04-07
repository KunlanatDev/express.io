import 'package:flutter/material.dart';
import 'home_screen.dart';
import '../main.dart' show AppColors;

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;

  final List<Widget> _pages = [
    const HomeScreen(),
    const Center(child: Text("Earnings Dashboard Placeholder")),
    const Center(child: Text("Job History Placeholder")),
    const Center(child: Text("Profile & Setup Placeholder")),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: NavigationBarTheme(
          data: NavigationBarThemeData(
            indicatorColor: AppColors.primaryLight,
            labelTextStyle: MaterialStateProperty.all(
              const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Color(0xFF64748B),
              ),
            ),
          ),
          child: NavigationBar(
            animationDuration: const Duration(milliseconds: 300),
            selectedIndex: _currentIndex,
            onDestinationSelected: (int newIndex) {
              setState(() {
                _currentIndex = newIndex;
              });
            },
            backgroundColor: Colors.white,
            elevation: 0,
            destinations: const [
              NavigationDestination(
                selectedIcon: Icon(Icons.explore, color: AppColors.primary),
                icon: Icon(Icons.explore_outlined, color: Color(0xFF64748B)),
                label: 'Jobs Map',
              ),
              NavigationDestination(
                selectedIcon: Icon(
                  Icons.account_balance_wallet,
                  color: AppColors.primary,
                ),
                icon: Icon(
                  Icons.account_balance_wallet_outlined,
                  color: Color(0xFF64748B),
                ),
                label: 'Earnings',
              ),
              NavigationDestination(
                selectedIcon: Icon(Icons.history, color: AppColors.primary),
                icon: Icon(Icons.history_outlined, color: Color(0xFF64748B)),
                label: 'History',
              ),
              NavigationDestination(
                selectedIcon: Icon(Icons.person, color: AppColors.primary),
                icon: Icon(Icons.person_outline, color: Color(0xFF64748B)),
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
