import { attachHeroVideo, detachHeroVideo } from "../components/hero-video";
import { staggerLists } from "../components/lists";
import { revealPortrait } from "../components/portrait";
import { revealSteps } from "../components/steps";
import { animateTimeline } from "../components/timeline";
import { gsap, SplitText } from "../gsap";
import { DUR, EASE, STAGGER, prefersReducedMotion } from "../motion";

let ctx: gsap.Context | null = null;

export function init(container: HTMLElement): void {
  attachHeroVideo(container);
  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    // Firm statement: words brighten as the paragraph scrolls through, like being read aloud.
    const statement = container.querySelector<HTMLElement>("[data-read-aloud]");
    if (statement) {
      SplitText.create(statement, {
        type: "words",
        // Words stay real text nodes, so screen readers read them normally; aria-label is not allowed on <p>.
        aria: "none",
        autoSplit: true,
        onSplit(self) {
          return gsap.fromTo(
            self.words,
            { opacity: 0.25 },
            {
              opacity: 1,
              ease: EASE.linear,
              stagger: 0.1,
              scrollTrigger: { trigger: statement, start: "top 80%", end: "bottom 50%", scrub: true },
            },
          );
        },
      });
    }

    // Question section: headline wipes in from the left, the answers follow.
    const question = container.querySelector<HTMLElement>("[data-question]");
    if (question) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: question, start: "top 70%" } });
      tl.fromTo(
        question.querySelector("[data-question-headline]"),
        { clipPath: "inset(0% 100% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: DUR.slow, ease: EASE.expo, clearProps: "clipPath" },
      ).from(
        question.querySelectorAll("[data-question-answer]"),
        { opacity: 0, y: 24, duration: DUR.base, ease: EASE.out, stagger: STAGGER },
        "-=0.6",
      );
    }

    // Practice-area link lists: items stagger in, per group.
    staggerLists(container, "[data-practice-list]");

    revealPortrait(container);
    animateTimeline(container);
    revealSteps(container);
  }, container);
}

export function destroy(): void {
  detachHeroVideo();
  ctx?.revert();
  ctx = null;
}
