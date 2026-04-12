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
- Ürün adı / kategori düzenleme
- Kritik/tükenen ürün etiketleri
- Arama (ürün adı, SKU, kategori)
- KPI kartları (toplam, sağlıklı, kritik, tükenen)
- CSV dışa aktarma ve içe aktarma
- Tüm veriyi temizleme
- Verileri `localStorage` ile saklama
