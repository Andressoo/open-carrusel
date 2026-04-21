import { Composition } from "remotion";
import { TikTokHook, TikTokHookSchema } from "@/lib/remotion/TikTokHook";
import { BeforeAfter, BeforeAfterSchema } from "@/lib/remotion/BeforeAfter";
import {
  ViralManifesto60s,
  ViralManifesto60sSchema,
} from "@/lib/remotion/ViralManifesto60s";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
    </>
  );
};
