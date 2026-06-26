import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const slides = [
    {
        id: 1,
        niche: "Cloths",
        title: "Premium Fashion Collection",
        description: "Discover the latest trends in women's and men's clothing. From casual wear to formal outfits, find your perfect style.",
        buttonText: "Shop Cloths",
        buttonLink: "/shop?category=Cloths",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600"
    },
    {
        id: 2,
        niche: "Shoes",
        title: "Step Up Your Style",
        description: "Premium footwear for every occasion. Sneakers, formal shoes, sandals, and boots from top brands.",
        buttonText: "Shop Shoes",
        buttonLink: "/shop?category=Shoes",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600"
    },
    {
        id: 3,
        niche: "Bags",
        title: "Carry Your World",
        description: "Stylish and functional bags for work, travel, and everyday use. Backpacks, totes, and messenger bags.",
        buttonText: "Shop Bags",
        buttonLink: "/shop?category=Bags",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1600"
    },
    {
        id: 4,
        niche: "Furniture",
        title: "Transform Your Space",
        description: "Modern and classic furniture pieces for your home. Sofas, tables, chairs, and beds that combine comfort and style.",
        buttonText: "Shop Furniture",
        buttonLink: "/shop?category=Furniture",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600"
    },
    {
        id: 5,
        niche: "Jewelries",
        title: "Timeless Elegance",
        description: "Exquisite jewelry pieces that celebrate life's special moments. Necklaces, rings, earrings, and bracelets.",
        buttonText: "Shop Jewelries",
        buttonLink: "/shop?category=Jewelries",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600"
    },
    {
        id: 6,
        niche: "Accessories",
        title: "Complete Your Look",
        description: "The perfect finishing touches. Watches, belts, hats, and sunglasses to elevate any outfit.",
        buttonText: "Shop Accessories",
        buttonLink: "/shop?category=Accessories",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1600"
    },
    {
        id: 7,
        niche: "Electronics",
        title: "Latest Tech Gear",
        description: "Cutting-edge electronics and gadgets. Smartphones, laptops, headphones, and smart home devices.",
        buttonText: "Shop Electronics",
        buttonLink: "/shop?category=Electronics",
        image: "https://images.unsplash.com/photo-1592899677977-9e10ca588c9c?w=1600"
    },
    {
        id: 8,
        niche: "Sports",
        title: "Active Lifestyle",
        description: "Gear up for your fitness journey. Sportswear, equipment, and accessories for every activity.",
        buttonText: "Shop Sports",
        buttonLink: "/shop?category=Sports",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600"
    },
    {
        id: 9,
        niche: "Beauty",
        title: "Glow Naturally",
        description: "Premium beauty and skincare products. Makeup, skincare, haircare, and fragrances.",
        buttonText: "Shop Beauty",
        buttonLink: "/shop?category=Beauty",
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600"
    },
    {
        id: 10,
        niche: "Toys & Games",
        title: "Joy for All Ages",
        description: "Toys, games, and collectibles for kids and adults. Find the perfect gift for every occasion.",
        buttonText: "Shop Toys",
        buttonLink: "/shop?category=Toys",
        image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=1600"
    }
];

const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    return (
        <div className="relative w-full overflow-hidden -mt-0.5" style={{ height: '450px' }}>
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${index === currentSlide
                        ? 'opacity-100 z-10'
                        : 'opacity-0 z-0'
                        }`}
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${slide.image})` }}
                    />

                    {/* Dark Overlay for text readability - opacity adjusted */}
                    <div className="absolute inset-0 bg-black/50" />

                    {/* Content */}
                    <div className="relative h-full w-full flex items-center justify-center px-4">
                        <div className="max-w-3xl text-center text-white">
                            <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                                {slide.niche}
                            </span>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fadeIn">
                                {slide.title}
                            </h1>
                            <p className="text-base md:text-lg lg:text-xl mb-8 max-w-2xl mx-auto opacity-90">
                                {slide.description}
                            </p>
                            <a
                                href={slide.buttonLink}
                                className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
                            >
                                {slide.buttonText}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all z-20 hover:scale-110"
                aria-label="Previous slide"
            >
                <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all z-20 hover:scale-110"
                aria-label="Next slide"
            >
                <FiChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                            ? 'w-8 bg-white'
                            : 'w-2 bg-white/50 hover:bg-white/80'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;