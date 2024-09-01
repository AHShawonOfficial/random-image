import axios from 'axios';
import { UNSPLASH_AUTHORIZATION_STRING } from '../utils/constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';

const unsplashTimeoutPeriod = 72000;
const regularTimeoutPeriod = 5000;

export default function ImagePage() {
   const handle = useFullScreenHandle();

   const [shouldLoadUnsplash, setShouldLoadUnsplash] = useState(false);
   const [shouldLoadRegular, setShouldLoadRegular] = useState(false);
   const [imageUrl, setImageUrl] = useState<{
      type: 'unsplash' | 'vercel' | 'picsum';
      url: string;
   } | null>(null);

   const hasPageLoaded = useRef(false);

   useEffect(() => {
      if (hasPageLoaded.current === true) return;
      hasPageLoaded.current = true;

      let timeoutIdUnsplash: NodeJS.Timeout;
      let timeoutIdRegular: NodeJS.Timeout;

      (async () => {
         const image = await getRandomImageUnsplash();

         if (image) {
            setImageUrl({ type: 'unsplash', url: image });

            timeoutIdUnsplash = setTimeout(() => {
               setShouldLoadUnsplash(true);
            }, unsplashTimeoutPeriod);
         } else {
            setImageUrl({
               type: 'vercel',
               url: `https://random-image-pepebigotes.vercel.app/api/random-image?v=${new Date().toISOString()}`,
            });
         }
         timeoutIdRegular = setTimeout(() => {
            setShouldLoadRegular(true);
         }, regularTimeoutPeriod);
      })();

      return () => {
         if (timeoutIdUnsplash) clearTimeout(timeoutIdUnsplash);
         if (timeoutIdRegular) clearTimeout(timeoutIdRegular);
         hasPageLoaded.current = true;
      };
   }, []);

   const handleKeyPresses = useCallback(
      async (event: KeyboardEvent) => {
         event.preventDefault();

         if (shouldLoadUnsplash) {
            const image = await getRandomImageUnsplash();
            if (image) {
               setImageUrl({ type: 'unsplash', url: image });
               setShouldLoadUnsplash(false);
               setTimeout(() => {
                  setShouldLoadUnsplash(true);
               }, unsplashTimeoutPeriod);
               setShouldLoadRegular(false);
               setTimeout(() => {
                  setShouldLoadRegular(true);
               }, regularTimeoutPeriod);
            }
         } else if (shouldLoadRegular) {
            setImageUrl(prev => {
               if (prev?.type === 'picsum') {
                  return {
                     type: 'vercel',
                     url: `https://random-image-pepebigotes.vercel.app/api/random-image?v=${new Date().toISOString()}`,
                  };
               } else {
                  return {
                     type: 'picsum',
                     url: `https://picsum.photos/1920/1080?v=${new Date().toISOString()}`,
                  };
               }
            });
            setShouldLoadRegular(false);
            setTimeout(() => {
               setShouldLoadRegular(true);
            }, regularTimeoutPeriod);
         }
      },
      [shouldLoadUnsplash, shouldLoadRegular]
   );

   useEffect(() => {
      document.addEventListener('keydown', handleKeyPresses);

      return () => {
         document.removeEventListener('keydown', handleKeyPresses);
      };
   }, [handleKeyPresses]);

   return (
      <div>
         <FullScreen handle={handle}>
            <div
               className='w-full h-dvh bg-cover bg-no-repeat bg-center'
               style={{
                  backgroundImage: `url(${imageUrl?.url})`,
               }}
            />
         </FullScreen>
         {document?.fullscreenElement ? (
            <button
               className='text-2xl border border-blue-300 size-10 flex items-center justify-center rounded-full fixed top-5 right-5'
               onClick={handle.exit}
            >
               <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                  className='size-5'
               >
                  <path
                     strokeLinecap='round'
                     strokeLinejoin='round'
                     d='M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25'
                  />
               </svg>
            </button>
         ) : (
            <button
               className='text-2xl border border-blue-300 size-10 flex items-center justify-center rounded-full fixed top-5 right-5'
               onClick={handle.enter}
            >
               <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                  className='size-5'
               >
                  <path
                     strokeLinecap='round'
                     strokeLinejoin='round'
                     d='M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15'
                  />
               </svg>
            </button>
         )}
      </div>
   );
}

function getRandomImageUnsplash() {
   return axios
      .get('https://api.unsplash.com/photos/random', {
         params: {
            query: 'cute baby',
            orientation: 'landscape',
            content_filter: 'high',
            count: 1,
         },
         headers: {
            Authorization: UNSPLASH_AUTHORIZATION_STRING,
            'Content-Type': 'application/json',
         },
      })
      .then(res => res.data[0]?.urls?.regular)
      .catch(
         error =>
            `https://random-image-pepebigotes.vercel.app/api/random-image?v=${new Date().toISOString()}`
      );
}
