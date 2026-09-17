import 'dart:convert';
import 'package:dmrtd/dmrtd.dart';
// Upstream does not re-export CAN from dmrtd.dart.
// ignore: implementation_imports
import 'package:dmrtd/src/proto/can_key.dart';
import 'package:flutter/material.dart';

String isoDate(DateTime d) =>
    '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
DateTime parseDate(String text) {
  final result = DateTime.tryParse(text);
  if (result == null ||
      !RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(text) ||
      isoDate(result) != text) {
    throw const FormatException('Tarihi YYYY-AA-GG biçiminde girin.');
  }
  return result;
}

bool validTc(String text) {
  if (!RegExp(r'^[1-9]\d{10}$').hasMatch(text)) return false;
  final d = text.split('').map(int.parse).toList();
  return ((d[0] + d[2] + d[4] + d[6] + d[8]) * 7 -
                  (d[1] + d[3] + d[5] + d[7])) %
              10 ==
          d[9] &&
      d.take(10).reduce((a, b) => a + b) % 10 == d[10];
}

String tcFromMrz(MRZ mrz) {
  if (mrz.country != 'TUR') return '';
  for (final s in [mrz.optionalData, mrz.optionalData2 ?? '']) {
    final match = RegExp(r'(?<!\d)[1-9]\d{10}(?!\d)').firstMatch(s);
    if (match != null && validTc(match.group(0)!)) return match.group(0)!;
  }
  return '';
}

class ReaderScreen extends StatefulWidget {
  final String program;
  const ReaderScreen({super.key, required this.program});
  @override
  State<ReaderScreen> createState() => _ReaderScreenState();
}

class _ReaderScreenState extends State<ReaderScreen> {
  final number = TextEditingController();
  final birth = TextEditingController();
  final expiry = TextEditingController();
  final can = TextEditingController();
  final tcManual = TextEditingController();
  final nfc = NfcProvider();
  String kind = 'passport';
  String method = 'bac';
  bool reading = false;
  bool cancelled = false;
  String status = '';
  @override
  void dispose() {
    number.dispose();
    birth.dispose();
    expiry.dispose();
    can.dispose();
    tcManual.dispose();
    nfc.disconnect();
    super.dispose();
  }

  Future<void> scan() async {
    cancelled = false;
    setState(() {
      reading = true;
      status = 'Belgeyi telefonun NFC bölgesine yaklaştırın ve sabit tutun…';
    });
    try {
      final availability = await NfcProvider.nfcStatus;
      final typedTc = tcManual.text.trim();
      if (typedTc.isNotEmpty && !validTc(typedTc)) {
        throw const FormatException(
          'Elle girilen T.C. numarası geçerli değil.',
        );
      }
      if (availability != NfcStatus.enabled) {
        throw StateError(
          availability == NfcStatus.disabled
              ? 'Telefon ayarlarından NFC’yi açın.'
              : 'Bu cihaz NFC okumayı desteklemiyor.',
        );
      }
      final AccessKey key;
      if (method == 'can') {
        if (!RegExp(r'^\d{6}$').hasMatch(can.text.trim())) {
          throw const FormatException(
            'Belgedeki 6 haneli CAN numarasını girin.',
          );
        }
        key = CanKey(can.text.trim());
      } else {
        if (!RegExp(
          r'^[A-Z0-9<]{1,9}$',
        ).hasMatch(number.text.trim().toUpperCase())) {
          throw const FormatException(
            'Belge numarasını MRZ satırındaki gibi girin (en fazla 9 karakter).',
          );
        }
        key = DBAKey(
          number.text.trim().toUpperCase(),
          parseDate(birth.text.trim()),
          parseDate(expiry.text.trim()),
          paceMode: method == 'pace',
        );
      }
      await nfc.connect(
        timeout: const Duration(seconds: 30),
        iosAlertMessage: 'Belgeyi telefonun üst kısmına yaklaştırın.',
      );
      if (!nfc.isConnected() || cancelled) {
        throw StateError('Okuma durduruldu veya uyumlu belge bulunamadı.');
      }
      final passport = Passport(nfc);
      if (method == 'bac') {
        await passport.startSession(key as DBAKey);
      } else {
        final access = await passport.readEfCardAccess();
        await passport.startSessionPACE(key, access);
      }
      await nfc.setIosAlertMessage('Kimlik bilgileri okunuyor…');
      final mrz = (await passport.readEfDG1()).mrz;
      final actualKind = mrz.documentCode.startsWith('P')
          ? 'passport'
          : 'identity';
      if (actualKind != kind) {
        throw StateError('Seçtiğiniz belge türü ile okunan belge farklı.');
      }
      final result = <String, dynamic>{
        'version': 1,
        'documentType': actualKind,
        'name': '${mrz.firstName} ${mrz.lastName}'
            .replaceAll('<', ' ')
            .replaceAll(RegExp(r'\s+'), ' ')
            .trim(),
        'tc': tcFromMrz(mrz),
        'birthDate': isoDate(mrz.dateOfBirth),
        'gender': mrz.gender == 'M'
            ? 'Erkek'
            : mrz.gender == 'F'
            ? 'Kadın'
            : '',
        'nationality': mrz.nationality,
        'issuingCountry': mrz.country,
        actualKind == 'passport' ? 'passportNo' : 'identityNo':
            mrz.documentNumber,
        actualKind == 'passport' ? 'passportEnd' : 'identityEnd': isoDate(
          mrz.dateOfExpiry,
        ),
      };
      try {
        await nfc.setIosAlertMessage(
          'Fotoğraf okunuyor, telefonu sabit tutun…',
        );
        final dg2 = await passport.readEfDG2();
        if (dg2.imageData != null &&
            dg2.imageData!.isNotEmpty &&
            dg2.imageData!.length <= 2000000) {
          result['photo'] =
              'data:image/${dg2.imageType == ImageType.jpeg ? 'jpeg' : 'jp2'};base64,${base64Encode(dg2.imageData!)}';
        } else {
          result['warning'] =
              'Kimlik bilgileri okundu; indirilebilir fotoğraf bulunamadı.';
        }
      } catch (_) {
        result['warning'] =
            'Kimlik bilgileri okundu; fotoğraf okunamadı. Fotoğraf için belgeyi yeniden okutabilirsiniz.';
      }
      try {
        final com = await passport.readEfCOM();
        if (com.dgTags.contains(EfDG11.TAG)) {
          final extra = await passport.readEfDG11();
          if (extra.fullDateOfBirth != null) {
            result['birthDate'] = isoDate(extra.fullDateOfBirth!);
          }
          if (mrz.country == 'TUR' && validTc(extra.personalNumber ?? '')) {
            result['tc'] = extra.personalNumber;
          }
          if (extra.placeOfBirth.isNotEmpty) {
            result['placeOfBirth'] = extra.placeOfBirth.join(' ');
          }
        }
        if (com.dgTags.contains(EfDG12.TAG)) {
          final extra = await passport.readEfDG12();
          if (actualKind == 'passport' && extra.dateOfIssue != null) {
            result['passportStart'] = isoDate(extra.dateOfIssue!);
          }
          if (extra.issuingAuthority != null) {
            result['issuingAuthority'] = extra.issuingAuthority;
          }
        }
      } catch (_) {
        /* Optional groups can be absent or access-restricted. */
      }
      if (typedTc.isNotEmpty) {
        final chipTc = (result['tc'] ?? '').toString();
        if (chipTc.isNotEmpty && chipTc != typedTc) {
          throw StateError(
            'Çipteki ve elle girilen T.C. numaraları farklı. Kayıt yapılmadı.',
          );
        }
        if (chipTc.isEmpty) {
          result['tc'] = typedTc;
          result['warning'] =
              'T.C. numarası çipte bulunamadı; elle girilen numara kullanıldı. Eşleşmeyi kontrol edin. ${result['warning'] ?? ''}';
        }
      }
      if (cancelled) throw StateError('Okuma iptal edildi.');
      await nfc.disconnect(
        iosAlertMessage: 'Okuma tamamlandı. Bilgileri kontrol edin.',
      );
      if (mounted) Navigator.of(context).pop(result);
    } catch (e) {
      try {
        await nfc.disconnect(
          iosErrorMessage:
              'Belge okunamadı. Bilgileri kontrol edip tekrar deneyin.',
        );
      } catch (_) {}
      if (mounted) {
        setState(() {
          status = e is FormatException
              ? e.message
              : e is StateError
              ? e.message
              : 'Belge okunamadı. Bilgileri, NFC konumunu ve erişim yöntemini kontrol edin. Kart erişimi kısıtlı olabilir.';
          reading = false;
        });
      }
    }
  }

  Widget input(
    String label,
    TextEditingController controller, {
    bool digits = false,
  }) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 8),
    child: TextField(
      controller: controller,
      enabled: !reading,
      autocorrect: false,
      enableSuggestions: false,
      keyboardType: digits ? TextInputType.number : TextInputType.text,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
    ),
  );
  @override
  Widget build(BuildContext context) => PopScope(
    canPop: !reading,
    child: Scaffold(
      appBar: AppBar(title: const Text('Belge okut')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            'Kayıt programı: ${widget.program}',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            initialValue: kind,
            decoration: const InputDecoration(labelText: 'Belge türü'),
            items: const [
              DropdownMenuItem(value: 'passport', child: Text('Pasaport')),
              DropdownMenuItem(value: 'identity', child: Text('Çipli kimlik')),
            ],
            onChanged: reading ? null : (v) => setState(() => kind = v!),
          ),
          DropdownButtonFormField<String>(
            initialValue: method,
            decoration: const InputDecoration(labelText: 'Çipe erişim'),
            items: const [
              DropdownMenuItem(
                value: 'bac',
                child: Text('MRZ bilgileri / BAC'),
              ),
              DropdownMenuItem(
                value: 'pace',
                child: Text('MRZ bilgileri / PACE'),
              ),
              DropdownMenuItem(
                value: 'can',
                child: Text('CAN numarası / PACE'),
              ),
            ],
            onChanged: reading ? null : (v) => setState(() => method = v!),
          ),
          if (method == 'can')
            input('CAN (6 hane)', can, digits: true)
          else ...[
            input('Belge numarası', number),
            input('Doğum tarihi (YYYY-AA-GG)', birth),
            input('Belge bitiş tarihi (YYYY-AA-GG)', expiry),
          ],
          input(
            'T.C. kimlik no (çipte yoksa, isteğe bağlı)',
            tcManual,
            digits: true,
          ),
          const Text(
            'Çipi açmak için belge üzerindeki bilgiler gereklidir. CAN her belgede bulunmaz. Eski çipsiz kimlikler okunamaz. Başlangıç tarihi yalnızca çipin ek belge bilgileri okunabiliyorsa doldurulur.',
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: reading ? null : scan,
            child: Text(reading ? 'Okunuyor…' : 'NFC okumayı başlat'),
          ),
          if (reading) ...[
            const LinearProgressIndicator(),
            TextButton(
              onPressed: () async {
                cancelled = true;
                try {
                  await nfc.disconnect();
                } catch (_) {}
              },
              child: const Text('Okumayı durdur'),
            ),
          ],
          Padding(padding: const EdgeInsets.only(top: 16), child: Text(status)),
        ],
      ),
    ),
  );
}
