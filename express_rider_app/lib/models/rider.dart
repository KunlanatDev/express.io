class Rider {
  final String id;
  final String name;
  final String phone;
  final String vehicleType;
  final String vehiclePlate;
  final String avatar;
  final double walletBalance;
  final double lat;
  final double lng;

  Rider({
    required this.id,
    required this.name,
    required this.phone,
    required this.vehicleType,
    required this.vehiclePlate,
    required this.avatar,
    required this.walletBalance,
    required this.lat,
    required this.lng,
  });

  // Mock static data
  static final Rider mock = Rider(
    id: "00000000-0000-0000-0000-000000000001",
    name: "Somchai P. (Rider)",
    phone: "081-999-9999",
    vehicleType: "Motorcycle",
    vehiclePlate: "1กข 9999",
    avatar: "https://via.placeholder.com/150",
    walletBalance: 1250.50,
    lat: 13.7462,
    lng: 100.5348,
  );
}
