# YWEB-OS

Bu proje, temel bir Web tabanlı işletim sistemi (WEB-OS) deneyimi için başlangıç altyapısı içerir.

## İçerikler

- `index.html`: Ana arayüz ve masaüstü yapısı.
- `style.css`: Temel stil ve pencere tasarımı.
- `script.js`: Uygulama kayıt sistemi, ana menü ve pencere yönetimi.

## Nasıl çalışır?

1. `startButton` ile ana uygulama menüsünü açabilirsiniz.
2. `script.js` içinde `registerApp(...)` çağrıları örnek uygulamalar ekler.
3. `openApp(appId)` ile uygulama penceresi açılır ve pencere kapatma butonu ile kapatılabilir.

## Yeni uygulama ekleme

Yeni bir uygulama eklemek için `script.js` içinde `registerApp` fonksiyonunu kullanın:

```js
registerApp({
  id: 'yeniUygulama',
  name: 'Yeni Uygulama',
  icon: '⭐',
  render(container) {
    container.innerHTML = '<p>Yeni uygulama içeriği buraya gelir.</p>';
  }
});
```

- `id`: Uygulamanın benzersiz kimliğidir.
- `name`: Menüde görünen isim.
- `icon`: Menüde gösterilecek simge (emoji ya da kısa metin).
- `render(container)`: Uygulama açıldığında çalışacak fonksiyon. `container` içine HTML içeriği ekleyebilirsiniz.

## Çalıştırma

Bu dosyaları bir tarayıcıda `index.html` açarak çalıştırabilirsiniz.
