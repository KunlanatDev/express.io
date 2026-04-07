import 'dart:math' as math;
import 'package:flutter/material.dart';

// ─── Minimal LatLng replacement (google_maps_flutter removed for macOS) ───────

class LatLng {
  final double latitude;
  final double longitude;
  const LatLng(this.latitude, this.longitude);
}

// ─── MapPlaceholder ───────────────────────────────────────────────────────────

/// A full-screen animated map background with an optional overlay child.
/// Works on all platforms (no native plugin required).
class MapPlaceholder extends StatefulWidget {
  final Widget child;
  const MapPlaceholder({super.key, required this.child});

  @override
  State<MapPlaceholder> createState() => _MapPlaceholderState();
}

class _MapPlaceholderState extends State<MapPlaceholder>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: double.infinity,
      child: Stack(
        children: [
          AnimatedBuilder(
            animation: _controller,
            builder: (_, __) => CustomPaint(
              painter: _MapPainter(_controller.value),
              child: const SizedBox.expand(),
            ),
          ),
          widget.child,
        ],
      ),
    );
  }
}

// ─── RiderMap ─────────────────────────────────────────────────────────────────

/// Animated map that shows a moving rider marker.
/// Works on all platforms (no native plugin required).
class RiderMap extends StatefulWidget {
  final LatLng center;
  final LatLng? riderPosition;
  final LatLng? pickupPosition;
  final LatLng? dropoffPosition;

  const RiderMap({
    super.key,
    required this.center,
    this.riderPosition,
    this.pickupPosition,
    this.dropoffPosition,
  });

  @override
  State<RiderMap> createState() => _RiderMapState();
}

class _RiderMapState extends State<RiderMap>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, __) => CustomPaint(
        painter: _RiderMapPainter(
          animValue: _controller.value,
          riderPosition: widget.riderPosition,
          pickupPosition: widget.pickupPosition,
          dropoffPosition: widget.dropoffPosition,
          center: widget.center,
        ),
        child: const SizedBox.expand(),
      ),
    );
  }
}

// ─── Painter helpers ──────────────────────────────────────────────────────────

class _MapPainter extends CustomPainter {
  final double animValue;
  _MapPainter(this.animValue);

  @override
  void paint(Canvas canvas, Size size) {
    _drawMapBackground(canvas, size, animValue);
  }

  @override
  bool shouldRepaint(_MapPainter old) => old.animValue != animValue;
}

class _RiderMapPainter extends CustomPainter {
  final double animValue;
  final LatLng center;
  final LatLng? riderPosition;
  final LatLng? pickupPosition;
  final LatLng? dropoffPosition;

  _RiderMapPainter({
    required this.animValue,
    required this.center,
    this.riderPosition,
    this.pickupPosition,
    this.dropoffPosition,
  });

  @override
  void paint(Canvas canvas, Size size) {
    _drawMapBackground(canvas, size, animValue);

    final cx = size.width / 2;
    final cy = size.height / 2;

    // Draw a dashed route line from pickup → rider → dropoff
    if (pickupPosition != null || dropoffPosition != null) {
      final routePaint = Paint()
        ..color = const Color(0xFF3960ED).withValues(alpha: 0.5)
        ..strokeWidth = 3
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;

      final path = Path();
      if (pickupPosition != null) {
        path.moveTo(cx - 60, cy + 60);
      } else {
        path.moveTo(cx, cy);
      }
      path.lineTo(cx, cy);
      if (dropoffPosition != null) {
        path.lineTo(cx + 80, cy - 80);
      }
      _drawDashedPath(canvas, path, routePaint);
    }

    // Pickup marker (blue)
    if (pickupPosition != null) {
      _drawPinMarker(canvas, Offset(cx - 60, cy + 60), const Color(0xFF3960ED), Icons.storefront);
    }

    // Dropoff marker (green)
    if (dropoffPosition != null) {
      _drawCircleMarker(canvas, Offset(cx + 80, cy - 80), Colors.green);
    }

    // Rider marker (animated pulse)
    _drawRiderMarker(canvas, Offset(cx, cy), animValue);
  }

  @override
  bool shouldRepaint(_RiderMapPainter old) => true;
}

// ─── Shared drawing functions ─────────────────────────────────────────────────

void _drawMapBackground(Canvas canvas, Size size, double animValue) {
  // Base map colour
  final bgPaint = Paint()..color = const Color(0xFFE8EDF2);
  canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

  final rand = math.Random(42);

  // ── Streets ──
  final streetPaint = Paint()
    ..color = const Color(0xFFFFFFFF)
    ..strokeWidth = 8
    ..strokeCap = StrokeCap.round;

  final minorStreetPaint = Paint()
    ..color = const Color(0xFFFFFFFF)
    ..strokeWidth = 4
    ..strokeCap = StrokeCap.round;

  // Horizontal main streets (slowly scroll)
  const hCount = 7;
  final hSpacing = size.height / (hCount - 1);
  for (int i = 0; i < hCount; i++) {
    final baseY = i * hSpacing;
    final y = baseY;
    // zig-zag slightly
    final path = Path();
    path.moveTo(0, y);
    final segments = 6;
    for (int s = 0; s <= segments; s++) {
      final x = s * size.width / segments;
      final jitter = rand.nextDouble() * 12 - 6;
      path.lineTo(x, y + jitter);
    }
    canvas.drawPath(path, streetPaint);
  }

  // Vertical main streets
  const vCount = 5;
  final vSpacing = size.width / (vCount - 1);
  for (int i = 0; i < vCount; i++) {
    final x = i * vSpacing;
    final path = Path();
    path.moveTo(x, 0);
    final segments = 6;
    for (int s = 0; s <= segments; s++) {
      final y = s * size.height / segments;
      final jitter = rand.nextDouble() * 12 - 6;
      path.lineTo(x + jitter, y);
    }
    canvas.drawPath(path, streetPaint);
  }

  // Minor streets
  final minorRand = math.Random(7);
  for (int i = 0; i < 8; i++) {
    final startX = minorRand.nextDouble() * size.width;
    final startY = minorRand.nextDouble() * size.height;
    final endX = startX + minorRand.nextDouble() * 200 - 100;
    final endY = startY + minorRand.nextDouble() * 200 - 100;
    canvas.drawLine(Offset(startX, startY), Offset(endX, endY), minorStreetPaint);
  }

  // ── City blocks (rectangles) ──
  final blockPaint = Paint()..color = const Color(0xFFD3DAE3);
  final blockRand = math.Random(99);
  for (int i = 0; i < 20; i++) {
    final x = blockRand.nextDouble() * (size.width - 80) + 20;
    final y = blockRand.nextDouble() * (size.height - 60) + 10;
    final w = blockRand.nextDouble() * 60 + 20;
    final h = blockRand.nextDouble() * 40 + 15;
    final rr = RRect.fromRectAndRadius(
      Rect.fromLTWH(x, y, w, h),
      const Radius.circular(4),
    );
    canvas.drawRRect(rr, blockPaint);
  }

  // ── Park ──
  final parkPaint = Paint()..color = const Color(0xFFB8D9B4).withValues(alpha: 0.7);
  canvas.drawRRect(
    RRect.fromRectAndRadius(
      Rect.fromLTWH(size.width * 0.6, size.height * 0.55, 90, 60),
      const Radius.circular(8),
    ),
    parkPaint,
  );

  // ── Subtle animated dots (traffic) ──
  final dotPaint = Paint()..color = const Color(0xFFFF6B35).withValues(alpha: 0.6);
  final dotRand = math.Random(11);
  for (int i = 0; i < 5; i++) {
    final baseX = dotRand.nextDouble() * size.width;
    final baseY = dotRand.nextDouble() * size.height;
    final speed = (dotRand.nextDouble() * 0.4 + 0.1);
    final progress = (animValue * speed + i * 0.2) % 1.0;
    final x = baseX + math.sin(progress * math.pi * 2) * 30;
    final y = baseY + math.cos(progress * math.pi * 2) * 15;
    canvas.drawCircle(Offset(x, y), 3, dotPaint);
  }
}

void _drawDashedPath(Canvas canvas, Path path, Paint paint) {
  final metrics = path.computeMetrics();
  const dashLength = 12.0;
  const gapLength = 8.0;
  for (final metric in metrics) {
    double distance = 0;
    bool draw = true;
    while (distance < metric.length) {
      final len = draw ? dashLength : gapLength;
      if (draw) {
        final segment = metric.extractPath(distance, distance + len);
        canvas.drawPath(segment, paint);
      }
      distance += len;
      draw = !draw;
    }
  }
}

void _drawPinMarker(Canvas canvas, Offset center, Color color, IconData icon) {
  final shadow = Paint()
    ..color = Colors.black.withValues(alpha: 0.2)
    ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);
  canvas.drawCircle(center.translate(0, 3), 20, shadow);

  final bg = Paint()..color = color;
  canvas.drawCircle(center, 20, bg);

  final border = Paint()
    ..color = Colors.white
    ..style = PaintingStyle.stroke
    ..strokeWidth = 2.5;
  canvas.drawCircle(center, 20, border);

  // Draw flag / store icon simplified as a white dot
  final iconPaint = Paint()..color = Colors.white;
  canvas.drawCircle(center, 7, iconPaint);
}

void _drawCircleMarker(Canvas canvas, Offset center, Color color) {
  final shadow = Paint()
    ..color = Colors.black.withValues(alpha: 0.2)
    ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);
  canvas.drawCircle(center.translate(0, 3), 16, shadow);

  final bg = Paint()..color = color;
  canvas.drawCircle(center, 16, bg);

  final border = Paint()
    ..color = Colors.white
    ..style = PaintingStyle.stroke
    ..strokeWidth = 2.5;
  canvas.drawCircle(center, 16, border);

  // White flag dot
  final iconPaint = Paint()..color = Colors.white;
  canvas.drawCircle(center, 5, iconPaint);
}

void _drawRiderMarker(Canvas canvas, Offset center, double animValue) {
  // Outer pulse ring
  final pulseRadius = 28.0 + 12.0 * math.sin(animValue * math.pi * 2);
  final pulsePaint = Paint()
    ..color = const Color(0xFF3960ED).withValues(alpha: 0.15);
  canvas.drawCircle(center, pulseRadius, pulsePaint);

  // Shadow
  final shadow = Paint()
    ..color = const Color(0xFF3960ED).withValues(alpha: 0.3)
    ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10);
  canvas.drawCircle(center, 22, shadow);

  // Main circle
  final bg = Paint()..color = const Color(0xFF3960ED);
  canvas.drawCircle(center, 20, bg);

  // White border
  final border = Paint()
    ..color = Colors.white
    ..style = PaintingStyle.stroke
    ..strokeWidth = 3;
  canvas.drawCircle(center, 20, border);

  // Bike icon simplified as line + circles
  final iconPaint = Paint()
    ..color = Colors.white
    ..strokeWidth = 2
    ..strokeCap = StrokeCap.round;
  // wheels
  canvas.drawCircle(center.translate(-6, 4), 4, iconPaint..style = PaintingStyle.stroke);
  canvas.drawCircle(center.translate(6, 4), 4, iconPaint..style = PaintingStyle.stroke);
  // frame
  canvas.drawLine(
    center.translate(-6, 4),
    center.translate(0, -3),
    iconPaint..style = PaintingStyle.fill,
  );
  canvas.drawLine(
    center.translate(0, -3),
    center.translate(6, 4),
    iconPaint,
  );
}
