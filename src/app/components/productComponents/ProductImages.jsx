import React, { useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

// import required modules
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';

export default function ProductImages({ProductImages}) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  return (
    <div className="w-full h-full max-h-[50vh] md:max-h-[80vh] overflow-hidden">
      <Swiper
        style={{
          '--swiper-navigation-color': '#fff',
          '--swiper-pagination-color': '#fff',
        }}
        spaceBetween={10}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper2 "
      >
        {
            ProductImages.map(productImage=>
            <SwiperSlide key={productImage.id} className="rounded-xl">
                <img className="cursor-grab rounded-xl" src={productImage.url} />
            </SwiperSlide>
            )
        }
        
      </Swiper>
    { ProductImages.length>1 &&
        <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper "
        >
            {ProductImages.map(productImage=>
            (<SwiperSlide key={productImage.id} >
                <img className="cursor-pointer rounded-xl" src={productImage.url} />
            </SwiperSlide>
            ))}
        
      </Swiper>
    }
    </div>
  );
}
