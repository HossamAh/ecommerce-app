import React, { useRef,useEffect, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import nextConfig from '../../../../next.config.mjs';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

// import required modules
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';

export default function ProductImages({ProductImages,currentImage}) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const mainSwiperRef = useRef(null);
  // Function to select a specific slide
  const goToSlide = (index) => {
      if (mainSwiperRef.current) {
          mainSwiperRef.current.slideTo(index); // Or slideToLoop(index) if loop is enabled
      }
  };
  useEffect(() => {
    if (currentImage) {
        // Find the index of the current image in the ProductImages array
        const imageIndex = ProductImages.findIndex(
            (image) => image.id === currentImage.id
        );

        // Check if the image was found
        if (imageIndex !== -1) {
            goToSlide(imageIndex);
        }
    }
}, [currentImage, ProductImages]);

  return (
    <div className="w-full h-full max-h-[50vh] md:max-h-[80vh] overflow-hidden">
      <Swiper
        style={{
          '--swiper-navigation-color': '#fff',
          '--swiper-pagination-color': '#fff',
        }}
        onSwiper={(swiper)=>(mainSwiperRef.current = swiper)}
        spaceBetween={10}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper2 "
      >
        {
            ProductImages.map(productImage=>
            <SwiperSlide zoom={true} key={productImage.id} className="rounded-xl">
                <img className="cursor-grab rounded-xl" src={productImage.url.includes("uploads")?`${nextConfig.env.API_URL}/${productImage.url}`:productImage.url} />
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
                <img className="cursor-pointer rounded-xl" src={productImage.url.includes("uploads")?`${nextConfig.env.API_URL}/${productImage.url}`:productImage.url} />
            </SwiperSlide>
            ))}
        
      </Swiper>
    }
    </div>
  );
}
