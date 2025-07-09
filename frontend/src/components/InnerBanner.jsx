import React from 'react';

const InnerBanner = ({ backgroundImage, title, description }) => {
    return (
        <section className="relative w-full h-[300px] sm:h-[400px] md:h-[400px] lg:h-[400px] xl:h-[400px] hero">
            <img
                src={backgroundImage}
                alt="Banner Background"
                className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0" style={{opacity: '30%'}}></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-white text-2xl sm:text-3xl md:text-[60px] font-bold mb-2">
                    {title}
                </h1>
                {description && (
                    <p className="text-white text-sm sm:text-base md:text-lg max-w-2xl">
                        {description}
                    </p>
                )}
            </div>
        </section>
    );
};

export default InnerBanner;
