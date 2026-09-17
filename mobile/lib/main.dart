import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:logging/logging.dart';
import 'package:share_plus/share_plus.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'reader.dart';

void main() {
  Logger.root.level = Level.OFF;
  runApp(
    const MaterialApp(debugShowCheckedModeBanner: false, home: TurizmApp()),
  );
}

bool trustedUrl(String? value) {
  final uri = Uri.tryParse(value ?? '');
  return uri != null &&
      uri.scheme == 'https' &&
      uri.host == 'www.hazeynturizm.com' &&
      uri.port == 443 &&
      ['/admin', '/admin.html'].contains(uri.path);
}

class TurizmApp extends StatefulWidget {
  const TurizmApp({super.key});
  @override
  State<TurizmApp> createState() => _TurizmAppState();
}

class _TurizmAppState extends State<TurizmApp> {
  late final WebViewController web;
  bool busy = false;
  String? photoId;
  String? photo;
  String status = 'Muhasebe ekranı yükleniyor…';
  @override
  void initState() {
    super.initState();
    web = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel('TurizmNfc', onMessageReceived: receive)
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (r) => trustedUrl(r.url)
              ? NavigationDecision.navigate
              : NavigationDecision.prevent,
          onPageStarted: (_) {
            photo = null;
            photoId = null;
          },
          onPageFinished: (_) async {
            final ready = await web.runJavaScriptReturningResult(
              'typeof window.installDocumentReader === "function"',
            );
            if (mounted) {
              setState(
                () => status = ready == true || ready.toString() == 'true'
                    ? 'Program seçin → NFC ile okut'
                    : 'NFC ekranı için web güncellemesi henüz yayınlanmamış.',
              );
            }
          },
          onWebResourceError: (e) {
            if (mounted && e.isForMainFrame == true) {
              setState(
                () => status =
                    'Bağlantı kurulamadı. İnterneti kontrol edip yenileyin.',
              );
            }
          },
        ),
      )
      ..loadRequest(
        Uri.parse('https://www.hazeynturizm.com/admin.html?mobile=1&nfc=1'),
      );
  }

  Future<void> receive(JavaScriptMessage message) async {
    if (busy ||
        !trustedUrl(await web.currentUrl()) ||
        message.message.length > 100000) {
      return;
    }
    try {
      final m = jsonDecode(message.message) as Map<String, dynamic>;
      final id = m['requestId'];
      if (id is! String || id.length > 80) return;
      if (m['action'] == 'photo' && photoId == id && photo != null) {
        final uri = UriData.parse(photo!);
        final ext = uri.mimeType == 'image/jp2' ? 'jp2' : 'jpg';
        await SharePlus.instance.share(
          ShareParams(
            files: [
              XFile.fromData(
                Uint8List.fromList(uri.contentAsBytes()),
                mimeType: uri.mimeType,
              ),
            ],
            fileNameOverrides: ['belge-fotografi.$ext'],
            sharePositionOrigin: const Rect.fromLTWH(0, 0, 100, 100),
          ),
        );
        return;
      }
      if (m['action'] != 'scan' ||
          m['context'] is! Map ||
          (m['context']['tourId'] ?? '').toString().isEmpty) {
        return;
      }
      busy = true;
      photo = null;
      photoId = null;
      if (!mounted) return;
      final result = await Navigator.of(context).push<Map<String, dynamic>>(
        MaterialPageRoute(
          builder: (_) => ReaderScreen(
            program: (m['context']['tourTitle'] ?? '').toString(),
          ),
        ),
      );
      if (!trustedUrl(await web.currentUrl())) return;
      photo = result?['photo'];
      photoId = id;
      final response = jsonEncode(
        result == null
            ? {'requestId': id, 'error': 'Okuma iptal edildi.'}
            : {'requestId': id, 'document': result},
      );
      await web.runJavaScript('window.turizmNfcResult?.($response);');
    } catch (_) {
      if (mounted) {
        setState(() => status = 'İşlem tamamlanamadı. Tekrar deneyin.');
      }
    } finally {
      busy = false;
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Turizm NFC'),
      actions: [
        IconButton(
          onPressed: busy ? null : () => web.reload(),
          icon: const Icon(Icons.refresh),
        ),
      ],
    ),
    body: SafeArea(
      child: Column(
        children: [
          Padding(padding: const EdgeInsets.all(8), child: Text(status)),
          Expanded(child: WebViewWidget(controller: web)),
        ],
      ),
    ),
  );
}
