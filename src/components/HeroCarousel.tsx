import React from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';

// import required modules
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';

const carouselImages = [
  '/carrusel1.png',
  '/carrusel2.png',
  '/carrusel3.png',
];

interface HeroCarouselProps {
  /** Emisoras disponibles en el listado actual. */
  count?: number;
}

/**
 * Apertura de la portada: el titular ocupa la mitad del ancho y las imágenes
 * ocupan la otra mitad, separadas por una sola regla vertical.
 */
const HeroCarousel: React.FC<HeroCarouselProps> = ({ count }) => {
  return (
    <section className="">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        <div className="flex flex-col justify-between py-8 lg:py-14">
          <h1 className="t-display text-[clamp(3rem,13vw,7.5rem)] lg:text-[clamp(3.5rem,6.5vw,7rem)]">
            Toda la radio<br />del mundo
          </h1>

          <div className="mt-8 lg:mt-12 flex items-end justify-between gap-6">
            <p className="text-[15px] leading-snug max-w-[34ch] text-meta-c">
              Emisoras en directo de más de 190 países. Elige una y suena; pídele
              al DJ que busque por ti cuando no sepas qué escuchar.
            </p>
            {typeof count === 'number' && count > 0 && (
              <p className="t-data text-[11px] text-meta-c shrink-0 text-right leading-relaxed">
                {count.toLocaleString('es')}
                <br />
                en lista
              </p>
            )}
          </div>
        </div>

        <div className="h-64 md:h-80 lg:h-auto lg:min-h-[420px] overflow-hidden">
          <Swiper
            modules={[Pagination, Autoplay, EffectFade]}
            slidesPerView={1}
            pagination={{
              clickable: true,
              bulletClass: 'sw-bullet',
              bulletActiveClass: 'sw-bullet-active',
            }}
            loop={true}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            effect="fade"
            className="h-full w-full"
          >
            {carouselImages.map((src, index) => (
              <SwiperSlide key={index}>
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover grayscale contrast-110"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style>{`
        .sw-bullet {
          display: inline-block;
          width: 28px;
          height: 3px;
          margin: 0 4px;
          background: #E9E6DF;
          opacity: 0.45;
          cursor: pointer;
          transition: opacity .15s ease, background .15s ease;
        }
        .sw-bullet-active {
          opacity: 1;
          background: rgb(var(--signal));
        }
        .swiper-pagination {
          position: absolute;
          bottom: 16px;
          left: 0;
          right: 0;
          text-align: center;
          z-index: 10;
        }
      `}</style>
    </section>
  );
};

export default HeroCarousel;
