import { Composition, Folder } from "remotion";

// Storu native reel templates
import { TikTokHook, TikTokHookSchema } from "../lib/remotion/TikTokHook";
import { BeforeAfter, BeforeAfterSchema } from "../lib/remotion/BeforeAfter";
import {
  ViralManifesto60s,
  ViralManifesto60sSchema,
} from "../lib/remotion/ViralManifesto60s";

// Editor Pro Max templates (unified)
import { TikTokVideo } from "../epm/templates/social/TikTokVideo";
import { InstagramReel } from "../epm/templates/social/InstagramReel";
import { YouTubeShort } from "../epm/templates/social/YouTubeShort";
import { Presentation } from "../epm/templates/content/Presentation";
import { Testimonial } from "../epm/templates/content/Testimonial";
import { Announcement } from "../epm/templates/promo/Announcement";
import { ShowcaseComposition } from "../epm/compositions/Showcase";
import { BeforeAfterDemo } from "../epm/compositions/BeforeAfterDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ══ Storu native ══ */}
      <Folder name="Storu">
        <Composition
          id="TikTokHook"
          component={TikTokHook}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={TikTokHookSchema}
        />
        <Composition
          id="BeforeAfter"
          component={BeforeAfter}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={BeforeAfterSchema}
        />
        <Composition
          id="ViralManifesto60s"
          component={ViralManifesto60s}
          durationInFrames={1800}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={ViralManifesto60sSchema}
        />
      </Folder>

      {/* ══ EPM · Social ══ */}
      <Folder name="EPM-Social">
        <Composition
          id="EPM-TikTok"
          component={TikTokVideo}
          durationInFrames={270}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            hook: "¿Sabías esto?",
            body: "Los martes son tus mejores días si los diseñás.",
            cta: "Comentá MARTES",
          }}
        />
        <Composition
          id="EPM-InstagramReel"
          component={InstagramReel}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            headline: "Tu headline acá",
            subtext: "Texto de apoyo",
            brandName: "Storu",
          }}
        />
        <Composition
          id="EPM-YouTubeShort"
          component={YouTubeShort}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            title: "Título",
            subtitle: "Subtítulo",
          }}
        />
      </Folder>

      {/* ══ EPM · Content ══ */}
      <Folder name="EPM-Content">
        <Composition
          id="EPM-Presentation"
          component={Presentation}
          durationInFrames={450}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            slides: [
              { title: "Intro", body: "Slide uno" },
              { title: "Problema", body: "Qué estamos resolviendo" },
              { title: "Solución", body: "Cómo lo resolvemos" },
            ],
          }}
        />
        <Composition
          id="EPM-Testimonial"
          component={Testimonial}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            quote: "Cambió cómo vendemos los martes.",
            author: "Cliente real",
            role: "Dueño · restaurante",
          }}
        />
      </Folder>

      {/* ══ EPM · Promo ══ */}
      <Folder name="EPM-Promo">
        <Composition
          id="EPM-Announcement"
          component={Announcement}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            preTitle: "Presentamos",
            title: "Algo nuevo",
            subtitle: "El futuro llegó",
            cta: "Conocé más",
          }}
        />
        <Composition
          id="EPM-BeforeAfter"
          component={BeforeAfterDemo}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="EPM-Showcase"
          component={ShowcaseComposition}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  );
};
