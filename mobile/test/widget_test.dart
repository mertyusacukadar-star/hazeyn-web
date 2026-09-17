import 'package:flutter_test/flutter_test.dart';
import 'package:turizm_nfc/main.dart';
import 'package:turizm_nfc/reader.dart';
void main() {
  test('Only exact HTTPS admin origin is trusted', () {
    expect(trustedUrl('https://www.hazeynturizm.com/admin.html?mobile=1'), isTrue);
    for (final url in ['http://www.hazeynturizm.com/admin.html','https://evil.test/admin.html','https://www.hazeynturizm.com.evil.test/admin.html','https://www.hazeynturizm.com:444/admin.html','https://www.hazeynturizm.com/other','file:///admin.html']) {
      expect(trustedUrl(url), isFalse);
    }
  });
  test('Dates reject normalized impossible dates', () {
    expect(isoDate(parseDate('2000-02-29')), '2000-02-29');
    expect(() => parseDate('2001-02-29'), throwsFormatException);
    expect(() => parseDate('01/02/2000'), throwsFormatException);
  });
  test('TC checksum and length', () {
    expect(validTc('10000000146'), isTrue);
    expect(validTc('10000000147'), isFalse);
    expect(validTc('00000000000'), isFalse);
  });
}
