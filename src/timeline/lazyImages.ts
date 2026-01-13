/**
 * Lazy load background images using Intersection Observer API.
 * Images load 2000px before entering viewport to ensure seamless scrolling.
 * Prevents loading all images on page load, improving initial performance.
 */

export function initLazyImages(): void {
  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const imageUrl = element.dataset.bgImage;

          if (imageUrl && !element.dataset.loaded) {
            element.dataset.loaded = 'true';

            const img = new Image();

            img.onload = () => {
              element.style.backgroundImage = `url('${imageUrl}')`;
              element.classList.add('lazy-loading');

              setTimeout(() => {
                element.classList.remove('lazy-loading');
              }, 600);
            };

            img.src = imageUrl;

            observer.unobserve(element);
          }
        }
      });
    },
    {
      rootMargin: '2000px 0px',
      threshold: 0,
    }
  );

  document.querySelectorAll('.week-bg[data-bg-image]').forEach((el) => {
    imageObserver.observe(el);
  });
}
