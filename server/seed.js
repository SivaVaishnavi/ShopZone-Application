const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const Product = require('./models/Product');
const Review = require('./models/Review');
const User = require('./models/User');
const Cart = require('./models/Cart');
const Admin = require('./models/Admin');

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopzone';

const masterCatalog = [

  // ── MOBILES ──────────────────────────────────────────────────────────────
  {
    title: 'Smart Touchscreen Smartphone 5G',
    description: 'High performance 5G smartphone with crisp AMOLED display, 48MP triple camera, and 5000mAh battery life.',
    mainImg: 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=600&q=80',
    category: 'Mobiles', gender: 'Unisex', price: 34999, discount: 15,
    sizes: ['128GB', '256GB'],
  },
  {
    title: 'Vivo Y31 5G Mobile',
    description: 'Stunning 6.58-inch display with 90Hz refresh rate, 64MP camera, and 44W FlashCharge for rapid power-ups.',
    mainImg: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80',
    category: 'Mobiles', gender: 'Unisex', price: 19999, discount: 20,
    sizes: ['Standard', '128GB'],
  },
  {
    title: 'iPhone 15 Pro Max 256GB',
    description: 'Forged in titanium with the groundbreaking A17 Pro chip, customizable Action button, and ProRes video.',
    mainImg: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
    category: 'Mobiles', gender: 'Unisex', price: 134900, discount: 8,
    sizes: ['256GB', '512GB'],
  },
  {
    title: 'Samsung Galaxy S24 Ultra 5G',
    description: 'Galaxy AI is here. 200MP camera, Snapdragon 8 Gen 3 for Galaxy, and built-in S Pen.',
    mainImg: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80',
    category: 'Mobiles', gender: 'Unisex', price: 129999, discount: 10,
    sizes: ['256GB', '512GB'],
  },
  {
    title: 'OnePlus 12 5G 256GB',
    description: 'Snapdragon 8 Gen 3, Hasselblad triple camera system, 100W SUPERVOOC charging, and 120Hz ProXDR display.',
    mainImg: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80',
    category: 'Mobiles', gender: 'Unisex', price: 64999, discount: 12,
    sizes: ['256GB', '512GB'],
  },
  {
    title: 'Redmi Note 13 Pro 5G',
    description: '200MP OIS camera, Snapdragon 7s Gen 2, 5100mAh battery, and Corning Gorilla Glass 5 protection.',
    mainImg: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&q=80',
    category: 'Mobiles', gender: 'Unisex', price: 24999, discount: 18,
    sizes: ['128GB', '256GB'],
  },
  {
    title: 'Google Pixel 8 Pro 5G',
    description: "Google's best camera phone with Magic Eraser, Photo Unblur, and 7 years of OS updates guaranteed.",
    mainImg: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80',
    category: 'Mobiles', gender: 'Unisex', price: 106999, discount: 6,
    sizes: ['128GB', '256GB', '1TB'],
  },
  {
    title: 'Foldable Ultra-Compact Smartphone',
    description: 'Next-gen dual-screen foldable phone with revolutionary hinge technology and 120Hz inner display.',
    mainImg: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80',
    category: 'Mobiles', gender: 'Unisex', price: 89999, discount: 8,
    sizes: ['256GB'],
  },
  {
    title: 'Slim Quad-Camera Smartphone',
    description: 'Super thin body with high-definition 64MP quad camera and 67W fast charging technology.',
    mainImg: 'https://images.unsplash.com/photo-1528740096961-3798add19cb7?w=600&q=80',
    category: 'Mobiles', gender: 'Unisex', price: 24999, discount: 15,
    sizes: ['128GB'],
  },
  {
    title: 'Samsung Galaxy Z Flip 5 5G',
    description: 'Iconic 3.4-inch Flex Window, FlexCam hands-free shooting, Snapdragon 8 Gen 2 for Galaxy, and IPX8 water resistance.',
    mainImg: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80',
    category: 'Mobiles', gender: 'Unisex', price: 99999, discount: 15,
    sizes: ['256GB', '512GB'],
  },
  {
    title: 'Realme GT 5 Pro 5G',
    description: 'Periscope telephoto lens with Sony IMX890 sensor, Snapdragon 8 Gen 3, and 5400mAh battery with 100W SuperVOOC charging.',
    mainImg: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&q=80',
    category: 'Mobiles', gender: 'Unisex', price: 44999, discount: 10,
    sizes: ['256GB', '512GB'],
  },
  {
    title: 'iPhone 15 128GB Pink',
    description: 'Dynamic Island, 48MP main camera, 2x Telephoto lens, A16 Bionic chip, and durable color-infused glass design.',
    mainImg: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80',
    category: 'Mobiles', gender: 'Unisex', price: 79900, discount: 7,
    sizes: ['128GB', '256GB'],
  },
  {
    title: 'Motorola Edge 50 Pro 5G',
    description: "World's first AI-powered Pantone validated camera, 125W TurboPower charging, and 144Hz curved pOLED display.",
    mainImg: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600&q=80',
    category: 'Mobiles', gender: 'Unisex', price: 31999, discount: 14,
    sizes: ['256GB'],
  },

  // ── ELECTRONICS ───────────────────────────────────────────────────────────
  {
    title: 'Wireless Stereo Headphones ANC',
    description: 'Immersive 40mm drivers with active noise cancellation, 30-hour battery, and ultra-soft memory foam ear cushions.',
    mainImg: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    category: 'Electronics', gender: 'Unisex', price: 5599, discount: 20,
    sizes: [],
  },
  {
    title: 'Digital Drawing Tablet with Pen',
    description: 'Professional drawing tablet with 8192 pressure levels, tilt support, and wireless active stylus.',
    mainImg: 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=600&q=80',
    category: 'Electronics', gender: 'Unisex', price: 3999, discount: 10,
    sizes: [],
  },
  {
    title: 'MacBook Pro 16" M3 Max',
    description: 'M3 Max 16-core CPU, 40-core GPU, and a Liquid Retina XDR display for mind-blowing performance.',
    mainImg: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
    category: 'Electronics', gender: 'Unisex', price: 249900, discount: 5,
    sizes: ['36GB/1TB', '48GB/1TB'],
  },
  {
    title: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise cancellation with two chips and eight microphones. 30-hr battery, multipoint connection.',
    mainImg: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80',
    category: 'Electronics', gender: 'Unisex', price: 29990, discount: 15,
    sizes: [],
  },
  {
    title: '4K Smart LED TV 55"',
    description: '4K Ultra HD with Dolby Vision, HDR10+, built-in Alexa, and ultra-slim bezel for immersive viewing.',
    mainImg: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&q=80',
    category: 'Electronics', gender: 'Unisex', price: 54990, discount: 22,
    sizes: ['43"', '55"', '65"'],
  },
  {
    title: 'Apple iPad Pro 12.9" M2',
    description: 'M2 chip with ProMotion 120Hz Liquid Retina display, Apple Pencil hover support, and Thunderbolt.',
    mainImg: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80',
    category: 'Electronics', gender: 'Unisex', price: 112900, discount: 7,
    sizes: ['128GB', '256GB', '512GB'],
  },
  {
    title: 'Portable Bluetooth Soundbar',
    description: '360° surround sound, powerful bass radiators, 12-hour battery, and waterproof IPX7 rating.',
    mainImg: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
    category: 'Electronics', gender: 'Unisex', price: 3499, discount: 14,
    sizes: [],
  },
  {
    title: 'Canon EOS R50 Mirrorless Camera',
    description: '24.2MP APS-C sensor, 4K video, DIGIC X processor, Dual Pixel CMOS AF, and compact body.',
    mainImg: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
    category: 'Electronics', gender: 'Unisex', price: 74995, discount: 10,
    sizes: [],
  },
  {
    title: 'Apple Watch Series 9 GPS',
    description: 'Blood oxygen sensor, ECG, crash detection, and an always-on Retina display in aluminium case.',
    mainImg: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600&q=80',
    category: 'Electronics', gender: 'Unisex', price: 41900, discount: 8,
    sizes: ['41mm', '45mm'],
  },
  {
    title: 'Smart Fitness Tracker Band',
    description: 'Track heart rate, sleep, SpO2, and 100+ workout modes in an ultra-thin waterproof design.',
    mainImg: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80',
    category: 'Electronics', gender: 'Unisex', price: 2999, discount: 18,
    sizes: ['One Size'],
  },
  {
    title: 'Asus ROG Zephyrus G16 Gaming Laptop',
    description: 'Intel Core Ultra 9 processor, NVIDIA GeForce RTX 4070, 2.5K 240Hz OLED display, and CNC-machined aluminum chassis.',
    mainImg: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80',
    category: 'Electronics', gender: 'Unisex', price: 189990, discount: 8,
    sizes: ['16GB/1TB', '32GB/1TB'],
  },
  {
    title: 'Bose QuietComfort Ultra Earbuds',
    description: 'Breakthrough spatial audio, custom-tuned active noise cancellation, Touch control, and up to 6 hours battery life.',
    mainImg: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
    category: 'Electronics', gender: 'Unisex', price: 24900, discount: 12,
    sizes: [],
  },
  {
    title: 'LG UltraGear 27" Gaming Monitor',
    description: 'QHD Nano IPS panel with 1ms GTG response time, 180Hz refresh rate, HDR400, and NVIDIA G-SYNC compatibility.',
    mainImg: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
    category: 'Electronics', gender: 'Unisex', price: 32999, discount: 18,
    sizes: ['27 Inch'],
  },
  {
    title: 'Anker 65W GaN Fast Wall Charger',
    description: 'Ultra-compact 3-port fast charger for laptops, tablets, and smartphones with PowerIQ 4.0 dynamic power distribution.',
    mainImg: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80',
    category: 'Electronics', gender: 'Unisex', price: 3499, discount: 20,
    sizes: ['Standard'],
  },

  // ── FASHION ────────────────────────────────────────────────────────────────
  {
    title: 'Cotton Kurti Ethnic Print',
    description: 'Premium 100% cotton kurti with ethnic block print, perfect for office, college, and casual wear.',
    mainImg: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
    category: 'Fashion', gender: 'Women', price: 1899, discount: 10,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    title: "Men's Running Sport Shoes",
    description: 'Lightweight EVA sole with breathable mesh upper, anti-skid outsole, and superior cushioning.',
    mainImg: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    category: 'Fashion', gender: 'Men', price: 2450, discount: 20,
    sizes: ['7', '8', '9', '10', '11'],
  },
  {
    title: 'Bridal Lehenga Set',
    description: 'Hand-embroidered designer bridal lehenga with dupatta and blouse piece in premium silk fabric.',
    mainImg: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
    category: 'Fashion', gender: 'Women', price: 8999, discount: 25,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    title: "Men's Slim Fit Formal Shirt",
    description: 'Premium wrinkle-free cotton formal shirt with spread collar, perfect for office and business.',
    mainImg: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
    category: 'Fashion', gender: 'Men', price: 1499, discount: 30,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    title: 'Combo Shirt & T-Shirt Pack',
    description: 'Stylish combo of one formal shirt and one premium cotton round-neck t-shirt.',
    mainImg: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
    category: 'Fashion', gender: 'Men', price: 2799, discount: 30,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    title: 'Women Soft Silk Printed Saree',
    description: 'Elegant soft silk saree with intricate zari woven floral border and matching blouse piece.',
    mainImg: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80',
    category: 'Fashion', gender: 'Women', price: 3499, discount: 35,
    sizes: ['Free Size'],
  },
  {
    title: "Women's Floral Maxi Gown",
    description: 'Floral printed maxi gown with V-neck, adjustable back tie, and flowing A-line silhouette.',
    mainImg: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
    category: 'Fashion', gender: 'Women', price: 3299, discount: 35,
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    title: "Men's Premium Leather Jacket",
    description: 'Classic genuine full-grain leather jacket with YKK zippers, quilted inner lining, and snap collar.',
    mainImg: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
    category: 'Fashion', gender: 'Men', price: 7499, discount: 20,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    title: 'Women Leather Shoulder Bag',
    description: 'Spacious top-grain leather handbag with multiple compartments, gold hardware, and adjustable strap.',
    mainImg: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
    category: 'Fashion', gender: 'Women', price: 3299, discount: 25,
    sizes: [],
  },
  {
    title: "Men's Slim Fit Chinos",
    description: 'Stretch-twill chinos with a modern slim fit, flat front, and premium cotton blend fabric.',
    mainImg: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80',
    category: 'Fashion', gender: 'Men', price: 1799, discount: 15,
    sizes: ['28', '30', '32', '34', '36'],
  },
  {
    title: "Women's Denim Jacket",
    description: 'Classic oversized denim jacket with distressed details, chest pockets, and button-front closure.',
    mainImg: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
    category: 'Fashion', gender: 'Women', price: 2199, discount: 20,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    title: "Men's Sports Jogger Set",
    description: 'Moisture-wicking polyester jogger track suit with elastic waistband, zip pockets, and reflective logo.',
    mainImg: 'https://images.unsplash.com/photo-1616877217977-fe8d019afd76?w=600&q=80',
    category: 'Fashion', gender: 'Men', price: 1999, discount: 25,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    title: "Women's Designer Denim Overall Dress",
    description: 'Chic A-line denim dress with adjustable shoulder straps, utility pockets, and premium washed cotton denim finish.',
    mainImg: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80',
    category: 'Fashion', gender: 'Women', price: 2899, discount: 22,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    title: "Men's Classic Wool Blend Trench Coat",
    description: 'Double-breasted long wool trench coat with notch lapel, belt closure, and deep slant pockets for winter elegance.',
    mainImg: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80',
    category: 'Fashion', gender: 'Men', price: 6999, discount: 25,
    sizes: ['M', 'L', 'XL', 'XXL'],
  },
  {
    title: 'Unisex Vintage Polarized Sunglasses',
    description: 'Classic aviator style polarized UV400 sunglasses with lightweight metal alloy frame and anti-glare lenses.',
    mainImg: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80',
    category: 'Fashion', gender: 'Unisex', price: 1299, discount: 35,
    sizes: ['Medium', 'Large'],
  },
  {
    title: "Women's Ankle Strap Block Heel Sandals",
    description: 'Elegant open-toe heels with comfortable padded footbed, sturdy block heel, and secure ankle buckle strap.',
    mainImg: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',
    category: 'Fashion', gender: 'Women', price: 2599, discount: 15,
    sizes: ['5', '6', '7', '8', '9'],
  },
  {
    title: "Women's Oversized Knit Sweater",
    description: 'Cozy oversized turtleneck sweater crafted from ultra-soft acrylic wool blend fabric for chilly weather.',
    mainImg: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&q=80',
    category: 'Fashion', gender: 'Women', price: 2299, discount: 20,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    title: "Men's Waterproof Outdoor Parka Jacket",
    description: 'Heavy-duty thermal insulated parka coat with faux fur hood, windproof outer shell, and deep cargo pockets.',
    mainImg: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80',
    category: 'Fashion', gender: 'Men', price: 5499, discount: 18,
    sizes: ['M', 'L', 'XL', 'XXL'],
  },
  {
    title: "Women's High-Waisted Wide Leg Trousers",
    description: 'Tailored high-rise pleat-front trousers with side pockets and a flattering wide-leg silhouette.',
    mainImg: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
    category: 'Fashion', gender: 'Women', price: 1999, discount: 25,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    title: "Men's Classic Leather Loafers",
    description: 'Slip-on genuine leather penny loafers with cushioned footbed and durable non-slip rubber sole.',
    mainImg: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80',
    category: 'Fashion', gender: 'Men', price: 3499, discount: 15,
    sizes: ['7', '8', '9', '10', '11'],
  },
  {
    title: "Women's Silk Satin Pyjama Set",
    description: 'Luxurious 2-piece soft silk satin pyjama set with button-up shirt and elastic waist trousers.',
    mainImg: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&q=80',
    category: 'Fashion', gender: 'Women', price: 2799, discount: 30,
    sizes: ['S', 'M', 'L'],
  },
  {
    title: "Men's Denim Trucker Jacket",
    description: 'Classic 100% cotton denim trucker jacket with buttoned chest pockets and adjustable waist tabs.',
    mainImg: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80',
    category: 'Fashion', gender: 'Men', price: 3299, discount: 22,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    title: "Women's Crossbody Mini Handbag",
    description: 'Compact structured faux leather crossbody bag with chain strap and gold hardware accent.',
    mainImg: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80',
    category: 'Fashion', gender: 'Women', price: 1499, discount: 20,
    sizes: ['One Size'],
  },
  {
    title: "Men's Printed Casual Hawaiian Shirt",
    description: 'Lightweight breathable rayon short-sleeve resort shirt with tropical floral print.',
    mainImg: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80',
    category: 'Fashion', gender: 'Men', price: 1199, discount: 30,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    title: "Women's Floral Wrap Midi Dress",
    description: 'V-neck wrap dress with ruffle hem, cap sleeves, and self-tie waist belt in breathable viscose.',
    mainImg: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80',
    category: 'Fashion', gender: 'Women', price: 2499, discount: 15,
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    title: "Men's Cotton Polo T-Shirt 3-Pack",
    description: 'Set of 3 piqué cotton short-sleeve polo shirts with rib collar and button placket.',
    mainImg: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=80',
    category: 'Fashion', gender: 'Men', price: 2199, discount: 25,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    title: "Women's Chunky Platform Sneakers",
    description: 'Retro 90s style chunky platform sneakers with breathable mesh panels and high-grip outsole.',
    mainImg: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
    category: 'Fashion', gender: 'Women', price: 2999, discount: 18,
    sizes: ['5', '6', '7', '8'],
  },
  {
    title: 'Unisex Wool Felt Fedora Hat',
    description: 'Classic wide-brim wool felt fedora hat with interior sweatband and ribbon band accent.',
    mainImg: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
    category: 'Fashion', gender: 'Unisex', price: 1299, discount: 20,
    sizes: ['Medium', 'Large'],
  },
  {
    title: "Men's Tailored Suit Blazer",
    description: 'Single-breasted 2-button formal suit jacket with notch lapel, dual vents, and fully lined interior.',
    mainImg: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
    category: 'Fashion', gender: 'Men', price: 5999, discount: 20,
    sizes: ['38R', '40R', '42R', '44R'],
  },
  {
    title: "Women's Leather Biker Jacket",
    description: 'Asymmetrical zip motorcycle jacket made from premium soft lambskin leather with zip cuffs.',
    mainImg: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&q=80',
    category: 'Fashion', gender: 'Women', price: 7999, discount: 15,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    title: 'Unisex Canvas Travel Duffel Bag',
    description: 'Heavy-duty vintage canvas weekend duffel bag with genuine leather trim and detachable shoulder strap.',
    mainImg: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    category: 'Fashion', gender: 'Unisex', price: 2699, discount: 25,
    sizes: ['45L'],
  },

  // ── GROCERIES ─────────────────────────────────────────────────────────────
  {
    title: 'Tata Salt 1kg',
    description: "India's most trusted iodized vacuum-evaporated salt with 100% natural iodine.",
    mainImg: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=600&q=80',
    category: 'Groceries', gender: 'Unisex', price: 100, discount: 25,
    sizes: ['1kg'],
  },
  {
    title: 'Premium Mixed Dry Fruits 500g',
    description: 'Handpicked mix of cashews, almonds, raisins, walnuts, and pistachios — rich in protein and omega-3.',
    mainImg: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&q=80',
    category: 'Groceries', gender: 'Unisex', price: 1199, discount: 10,
    sizes: ['500g', '1kg'],
  },
  {
    title: 'Yippee Noodles Pack of 12',
    description: 'Sunfeast Yippee Magic Masala instant noodles — long, non-sticky noodles with real masala flavour.',
    mainImg: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
    category: 'Groceries', gender: 'Unisex', price: 199, discount: 25,
    sizes: [],
  },
  {
    title: 'Fortune Sunflower Oil 5L',
    description: 'Fortune Sunlite refined sunflower oil with Oryzanol, rich in Vitamin E, light and healthy for daily cooking.',
    mainImg: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80',
    category: 'Groceries', gender: 'Unisex', price: 1499, discount: 14,
    sizes: ['1L', '5L'],
  },
  {
    title: 'Parachute Coconut Hair Oil',
    description: 'Pure coconut oil enriched with vitamin E and keratin proteins — prevents hairfall, dandruff, and breakage.',
    mainImg: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600&q=80',
    category: 'Groceries', gender: 'Unisex', price: 299, discount: 10,
    sizes: ['200ml', '500ml'],
  },
  {
    title: 'Pure Raw Organic Honey 500g',
    description: '100% pure unprocessed wild forest honey, naturally harvested by Himalayan bees, no added sugar.',
    mainImg: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=600&q=80',
    category: 'Groceries', gender: 'Unisex', price: 499, discount: 10,
    sizes: ['500g', '1kg'],
  },
  {
    title: 'Organic Whole Wheat Atta 5kg',
    description: 'Stone-ground whole wheat atta from certified organic farms — high fibre, perfect for rotis and parathas.',
    mainImg: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
    category: 'Groceries', gender: 'Unisex', price: 349, discount: 15,
    sizes: ['5kg', '10kg'],
  },
  {
    title: 'Premium Basmati Rice 5kg',
    description: 'Extra long grain aged Basmati rice with a signature nutty aroma, fluffy texture, and low glycemic index.',
    mainImg: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
    category: 'Groceries', gender: 'Unisex', price: 799, discount: 12,
    sizes: ['5kg', '10kg'],
  },
  {
    title: 'Amul Butter 500g',
    description: "India's favourite pasteurised butter — naturally creamy, zero artificial flavour or colour.",
    mainImg: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80',
    category: 'Groceries', gender: 'Unisex', price: 290, discount: 5,
    sizes: [],
  },
  {
    title: 'Assorted Biscuits Combo Pack',
    description: 'Gift pack of 6 popular biscuit varieties — Bourbon, Marie, Digestive, Oreo, Good Day, and Hide & Seek.',
    mainImg: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80',
    category: 'Groceries', gender: 'Unisex', price: 449, discount: 18,
    sizes: [],
  },
  {
    title: 'Green Tea Assorted 50 Bags',
    description: 'Premium green tea with tulsi, ginger, lemon, and jasmine variants — rich in antioxidants.',
    mainImg: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
    category: 'Groceries', gender: 'Unisex', price: 350, discount: 20,
    sizes: ['25 bags', '50 bags'],
  },
  {
    title: 'Organic Extra Virgin Olive Oil 1L',
    description: 'Cold-pressed 100% Spanish extra virgin olive oil, low acidity, rich in antioxidants for healthy salads and cooking.',
    mainImg: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80',
    category: 'Groceries', gender: 'Unisex', price: 1299, discount: 12,
    sizes: ['500ml', '1L'],
  },
  {
    title: 'Nescafe Gold Blend Coffee Jar 200g',
    description: 'Rich & smooth freeze-dried instant coffee crafted with high quality mountain-grown Arabica coffee beans.',
    mainImg: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80',
    category: 'Groceries', gender: 'Unisex', price: 899, discount: 10,
    sizes: ['100g', '200g'],
  },
  {
    title: 'Quaker Whole Oats 1kg Pack',
    description: '100% natural whole grain rolled oats, rich in dietary fiber, beta-glucan, and complex carbohydrates.',
    mainImg: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80',
    category: 'Groceries', gender: 'Unisex', price: 235, discount: 15,
    sizes: ['1kg'],
  },
  {
    title: 'Dark Chocolate Almond Butter 350g',
    description: 'Creamy slow-roasted almond butter infused with 70% dark cocoa, rich in protein with zero palm oil or refined sugar.',
    mainImg: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
    category: 'Groceries', gender: 'Unisex', price: 549, discount: 20,
    sizes: ['350g'],
  },

  // ── SPORTS EQUIPMENT ──────────────────────────────────────────────────────
  {
    title: 'Cricket Leather Ball Combo',
    description: 'Match-quality hand-stitched genuine leather cricket balls for turf, matting, and clay pitches.',
    mainImg: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80',
    category: 'Sports-Equipment', gender: 'Unisex', price: 700, discount: 20,
    sizes: [],
  },
  {
    title: 'Digital Stopwatch Timer',
    description: 'Professional multi-function digital stopwatch with lap memory, countdown timer, and water-resistant case.',
    mainImg: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=600&q=80',
    category: 'Sports-Equipment', gender: 'Unisex', price: 5999, discount: 25,
    sizes: [],
  },
  {
    title: 'Resistance Bands Set (5 Bands)',
    description: 'Heavy-duty latex resistance bands 5–40kg for full-body strength training and rehabilitation.',
    mainImg: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80',
    category: 'Sports-Equipment', gender: 'Unisex', price: 799, discount: 20,
    sizes: ['Set of 5'],
  },
  {
    title: 'Adjustable Dumbbell Set 20kg',
    description: 'Cast iron adjustable dumbbells with chrome handles, rubber-coated plates, and locking collar.',
    mainImg: 'https://images.unsplash.com/photo-1580086319619-3ed498161c77?w=600&q=80',
    category: 'Sports-Equipment', gender: 'Unisex', price: 4499, discount: 22,
    sizes: ['10kg Set', '20kg Set'],
  },
  {
    title: 'Yoga Mat Non-Slip 6mm',
    description: 'Thick 6mm TPE eco-friendly yoga mat with alignment lines, carry strap, and superior grip.',
    mainImg: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80',
    category: 'Sports-Equipment', gender: 'Unisex', price: 999, discount: 30,
    sizes: [],
  },
  {
    title: 'Carbon Fibre Badminton Racket',
    description: 'Professional-grade carbon fibre frame with isometric head and extra-stiff shaft for powerful smashes.',
    mainImg: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80',
    category: 'Sports-Equipment', gender: 'Unisex', price: 2999, discount: 18,
    sizes: ['G4', 'G5'],
  },
  {
    title: 'Football Training Cones 20-Pack',
    description: 'Fluorescent disc cones for agility drills, speed training, and field marking. Stackable storage.',
    mainImg: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600&q=80',
    category: 'Sports-Equipment', gender: 'Unisex', price: 499, discount: 15,
    sizes: [],
  },
  {
    title: 'Swimming Goggles Pro UV',
    description: 'Anti-fog UV-protected silicone swimming goggles with wide panoramic lens and adjustable nose bridge.',
    mainImg: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&q=80',
    category: 'Sports-Equipment', gender: 'Unisex', price: 799, discount: 20,
    sizes: [],
  },
  {
    title: 'Running Shoes Boost Pro',
    description: 'Energy-return boost midsole, Primeknit upper, and Continental rubber outsole for optimal grip.',
    mainImg: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
    category: 'Sports-Equipment', gender: 'Unisex', price: 8999, discount: 25,
    sizes: ['6', '7', '8', '9', '10', '11'],
  },
  {
    title: 'Carbon Fiber Tennis Racket',
    description: 'Ultra-lightweight tennis racket engineered for maximum power, control, and precision on every shot.',
    mainImg: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80',
    category: 'Sports-Equipment', gender: 'Unisex', price: 8999, discount: 15,
    sizes: ['Grip 2', 'Grip 3'],
  },
  {
    title: 'Professional Basketball Size 7',
    description: 'Composite leather indoor/outdoor basketball with deep channels and moisture-absorbing soft feel for grip.',
    mainImg: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80',
    category: 'Sports-Equipment', gender: 'Unisex', price: 1999, discount: 20,
    sizes: ['Size 7'],
  },
  {
    title: 'Adjustable Heavy Grip Hand Strengthener',
    description: 'Ergonomic hand gripper with 10–60kg adjustable resistance and built-in mechanical counter for grip strength.',
    mainImg: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&q=80',
    category: 'Sports-Equipment', gender: 'Unisex', price: 399, discount: 30,
    sizes: ['One Size'],
  },
  {
    title: 'Speed Agility Jump Rope with Bearings',
    description: 'Tangle-free steel wire jump rope with ball bearings and aluminum anti-slip handles for crossfit and speed cardio.',
    mainImg: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80',
    category: 'Sports-Equipment', gender: 'Unisex', price: 699, discount: 25,
    sizes: ['Adjustable'],
  },
  {
    title: 'Hydration Sports Water Bottle 1L',
    description: 'BPA-free leak-proof motivational water bottle with time markings, silicone straw, and fast-flow spout.',
    mainImg: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
    category: 'Sports-Equipment', gender: 'Unisex', price: 599, discount: 15,
    sizes: ['1L'],
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB (${mongoURI}) for master seeding...`);

    // Reset Products, Reviews, Cart & Admin settings
    await Product.deleteMany({});
    await Review.deleteMany({});
    await Cart.deleteMany({});
    await Admin.deleteMany({});

    // Ensure Admin & Customer Users exist
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const customerPassword = await bcrypt.hash('customer123', salt);

    let adminUser = await User.findOne({ email: 'admin@shopze.com' });
    if (!adminUser) {
      adminUser = await User.create({
        username: 'ShopZeAdmin',
        email: 'admin@shopze.com',
        password: adminPassword,
        usertype: 'Admin',
      });
    }

    let customerUser = await User.findOne({ email: 'john@example.com' });
    if (!customerUser) {
      customerUser = await User.create({
        username: 'JohnDoe',
        email: 'john@example.com',
        password: customerPassword,
        usertype: 'Customer',
      });
    }

    const inserted = await Product.insertMany(masterCatalog);
    console.log(`✅ Seeded ${inserted.length} products into shopzone database!`);

    // ── Seed sample reviews ──────────────────────────────────────────────────
    // Map category → review pool (same content as fallbackProducts.js)
    const reviewPools = {
      Mobiles: [
        { username: 'TechEnthusiast99',  rating: 5, title: 'Blazing fast performance',  body: 'Handles every task effortlessly. Battery life is outstanding and the camera is top-notch.', verified: true },
        { username: 'GadgetGuru',        rating: 4, title: 'Great value for money',      body: 'Solid build quality and snappy performance. Occasional heating under heavy load.', verified: true },
        { username: 'SnehaR',            rating: 5, title: 'Absolutely love it!',        body: 'The display is stunning and the camera captures incredible detail. Worth every rupee.', verified: false },
        { username: 'PraveenKumar',      rating: 3, title: 'Decent but overpriced',      body: 'Performance is okay but I expected more for the price. Battery could be better.', verified: true },
        { username: 'MobileFreak007',    rating: 4, title: 'Smooth and stylish',         body: 'Clean UI, fast fingerprint sensor, and a premium feel in hand. No complaints.', verified: false },
      ],
      Electronics: [
        { username: 'HomeSetupHero',     rating: 5, title: 'Perfect addition to my home', body: 'Setup was simple and the quality exceeded expectations. Highly recommend!', verified: true },
        { username: 'TechReviewer21',    rating: 4, title: 'Great build quality',         body: 'Sturdy and well-finished. Performs exactly as advertised.', verified: true },
        { username: 'AnjaliS',           rating: 5, title: 'Exceeded expectations',       body: 'Arrived well-packaged. Works flawlessly and looks premium.', verified: false },
        { username: 'VikasMehta',        rating: 3, title: 'Average performance',         body: 'Does the job but nothing spectacular. You get what you pay for.', verified: true },
        { username: 'ElectronicsFan',    rating: 4, title: 'Good purchase overall',       body: 'Very happy with the purchase. Solid performance and responsive support.', verified: false },
      ],
      'Sports-Equipment': [
        { username: 'FitnessFanatic',    rating: 5, title: 'Game changer for my workouts', body: 'Sturdy, well-built, and makes every session more effective. Love it!', verified: true },
        { username: 'SportsPro99',       rating: 4, title: 'Great quality gear',           body: 'Good grip and durable material. Perfect for regular use.', verified: true },
        { username: 'NeelamK',           rating: 5, title: 'Worth every penny',            body: 'Exactly as described. Comfortable and built to last.', verified: false },
        { username: 'AmitSport',         rating: 3, title: 'Okay but expected more',       body: 'Functional but the build feels slightly cheaper than the photos suggest.', verified: true },
        { username: 'ActiveLifeStyle',   rating: 4, title: 'Solid choice',                 body: 'Does the job very well. Fast delivery and good packaging.', verified: false },
      ],
      Fashion: [
        { username: 'StyleIconIndia',    rating: 5, title: 'Absolutely stylish',           body: 'Fits perfectly and the fabric feels premium. Got so many compliments!', verified: true },
        { username: 'FashionForwardZ',   rating: 4, title: 'Great quality fabric',         body: 'Colour is exactly as shown. Comfortable and easy to style.', verified: true },
        { username: 'PriyankaFashion',   rating: 5, title: 'Love the design',              body: 'Perfect for casual and semi-formal occasions. Very happy with the purchase.', verified: false },
        { username: 'RahulStyle',        rating: 3, title: 'Decent quality',               body: 'Looks good but the stitching could be neater. Wearable though.', verified: true },
        { username: 'TrendyKumar',       rating: 4, title: 'Good value',                   body: 'Nice colour, comfortable fit, and affordable price. Would buy again.', verified: false },
      ],
      Groceries: [
        { username: 'HealthyHomeChef',   rating: 5, title: 'Fresh and high quality',       body: 'Arrived fresh and well-packaged. Taste is excellent. Regular buy now.', verified: true },
        { username: 'OrganicLifeLover',  rating: 4, title: 'Great product',                body: 'Good quality for the price. Will definitely order again.', verified: true },
        { username: 'KitchenQueenMeera', rating: 5, title: 'Perfect for daily cooking',   body: 'Consistent quality every time. Fast delivery and great packaging.', verified: false },
        { username: 'FoodieRaj',         rating: 3, title: 'Average quality',              body: 'Not bad, but I have had better. Packaging could be improved.', verified: true },
        { username: 'NutriNerd',         rating: 4, title: 'Reliable choice',              body: 'Trustworthy product. Good taste and convenient delivery.', verified: false },
      ],
    };

    // Pick 3 reviews per product from the matching category pool
    const reviewDocs = [];
    for (const prod of inserted) {
      const pool = reviewPools[prod.category] || reviewPools['Electronics'];
      const picks = pool.slice(0, 3);
      for (const r of picks) {
        reviewDocs.push({
          productId: prod._id,
          userId: new mongoose.Types.ObjectId(),
          username: r.username,
          rating: r.rating,
          title: r.title,
          body: r.body,
          verified: r.verified,
        });
      }
      // Update aggregate rating on the product
      const avg = +(picks.reduce((s, r) => s + r.rating, 0) / picks.length).toFixed(1);
      await Product.findByIdAndUpdate(prod._id, { rating: avg, reviewCount: picks.length });
    }
    await Review.insertMany(reviewDocs);
    console.log(`✅ Seeded ${reviewDocs.length} reviews (3 per product).`);

    // Sample cart item for customer
    await Cart.create({
      userId: customerUser._id.toString(),
      productId: inserted[0]._id,
      title: inserted[0].title,
      mainImg: inserted[0].mainImg,
      size: '128GB',
      quantity: 1,
      price: inserted[0].price,
      discount: inserted[0].discount,
    });

    // Admin settings
    await Admin.create({
      banner: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMQE7fY6sY2C5mV2bAsVkEmaU7vdof4f25thukqsSAUw&s=10',
      categories: ['Mobiles', 'Electronics', 'Sports-Equipment', 'Fashion', 'Groceries'],
    });

    console.log('--- SEEDED PRODUCTS SUMMARY ---');
    console.log(`• Mobiles:          ${await Product.countDocuments({ category: 'Mobiles' })}`);
    console.log(`• Electronics:      ${await Product.countDocuments({ category: 'Electronics' })}`);
    console.log(`• Sports-Equipment: ${await Product.countDocuments({ category: 'Sports-Equipment' })}`);
    console.log(`• Fashion:          ${await Product.countDocuments({ category: 'Fashion' })}`);
    console.log(`• Groceries:        ${await Product.countDocuments({ category: 'Groceries' })}`);
    console.log(`• Total:            ${await Product.countDocuments()}`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
