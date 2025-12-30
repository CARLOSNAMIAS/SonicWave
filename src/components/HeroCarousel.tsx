import React from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';

// import required modules
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

const carouselImages = [
  '/carrusel1.png',
  '/carrusel2.png',
  '/carrusel3.png',
];

const HeroCarousel: React.FC = () => {
  return (
    <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden mb-12 shadow-2xl shadow-cyan-500/20">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={50}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        loop={true}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        effect="fade"
        className="h-full"
      >
        {carouselImages.map((src, index) => (
          <SwiperSlide key={index}>
            <img src={src} alt={`Carousel image ${index + 1}`} className="w-full h-full object-cover" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroCarousel;
