# BKYS-TAK-P

Vanilla HTML/CSS/JS ile hazırlanmış hafif bir ürün takip uygulaması.

## Çalıştırma

```bash
python3 -m http.server 8000
```

Tarayıcıdan açın:

- http://localhost:8000

## Özellikler

- Ürün ekleme (SKU benzersizlik kontrolü)
- Stok +1/-1 güncelleme
- Minimum stok değerini hızlı artırma
- Kritik/tükenen ürün etiketleri
- Arama (ürün adı, SKU, kategori)
- KPI kartları (toplam, sağlıklı, kritik, tükenen)
- Tüm veriyi temizleme
- Verileri `localStorage` ile saklama
