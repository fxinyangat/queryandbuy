import React from 'react';
import './BrandShowcase.css';
import { COLORS } from '../../styles/colors';
import img12 from '../../assets/imgages/img12_nike.jpg';
import img13 from '../../assets/imgages/img13_apple.jpg';
import img14 from '../../assets/imgages/img14_samsang.jpg';
import img15 from '../../assets/imgages/img15_canon.jpg';
import img16 from '../../assets/imgages/img16_rolex.jpg';
import img17 from '../../assets/imgages/img17_studio.jpg';
import cat3 from '../../assets/imgages/cat-gaming.jpg';
import cat1 from '../../assets/imgages/cat-fashion2.jpg';
import cat2 from '../../assets/imgages/cat-fashion3.jpg';
import cat4 from '../../assets/imgages/cat-cars.jpg';
import logo1 from '../../assets/imgages/logo_canon.jpg';
import logo2 from '../../assets/imgages/logo-rolex.png';
import logo3 from '../../assets/imgages/logo-apple.jpg';
import logo4 from '../../assets/imgages/logo-nike.png';
import logo5 from '../../assets/imgages/logo-samsung.png';






const BrandShowcase = () => {
  const brands = [
    {
      name: 'Canon',
      logo: logo1,
      image: img15,
      color: '#F5F5F5',
      discount: '',
      position: 'top-left'
    },
    {
      name: 'Rolex',
      logo: logo2,
      image: img16,
      color: '#F5F5F5',
      discount: '',
      position: 'top-center'
    },
    {
      name: 'Apple',
      logo: logo3,
      image: img13,
      color: '#FFFFFF',
      discount: '',
      position: 'top-right'
    },
    {
      name: 'Nike',
      logo: logo4,
      image: img12,
      color: '#FFFFFF',
      discount: '',
      position: 'bottom-left'
    },
    {
      name: 'Samsung',
      logo: logo5,
      image: img14,
      color: '#F5F5F5',
      discount: '',
      position: 'bottom-right'
    }
  ];


  const categories = [
    {
      name: 'Fashion',
      image: cat1,
      discount: ''
    },
    {
      name: 'Electronics',
      image: img17,
      discount: ''
    },
    {
      name: 'Automotives',
      image: cat4,
      discount: '4% Cash Back'
    }
  ];

  return (
    <section className="brand-showcase">
      <div className="brand-showcase-container">
        <h2 className="brand-title">Shop and compare in one place, from the brands you love</h2>
        
        {/* Top Row - 3 Cards */}
        <div className="top-row-grid">
          {brands.map((brand, index) => (
            <div key={index} className={`brand-card brand-card-${brand.position}`} style={{ backgroundColor: brand.color }}>
              <div className="brand-header">
                <div className="brand-logo">
                  <img src={brand.logo} alt={`${brand.name} logo`} />
                </div>
                <span className="brand-name">{brand.name}</span>
              </div>
              <div className="brand-image">
                <img src={brand.image} alt={brand.name} />
              </div>
              <div className="brand-discount">{brand.discount}</div>
            </div>
          ))}
        </div>

        {/* Cash Back Center */}
        <div className="cashback-center">
          <div className="cashback-large" style={{ color: COLORS.primary }}>5% cash back¹</div>
          <div className="cashback-subtitle">Get hundreds of cash back offers.</div>
          <button className="cashback-button">Browse Offers</button>
          <div className="cashback-disclaimer">Check offers for details. Terms and exclusions apply.</div>
        </div>

        {/* Category Cards */}
        <div className="category-grid">
          {categories.map((category, index) => (
            <div key={index} className="category-card">
              <div className="category-image">
                <img src={category.image} alt={category.name} />
                <div className="category-overlay">
                  <div className="category-name">{category.name}</div>
                  <div className="category-discount">{category.discount}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
