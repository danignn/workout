export interface VideoRef {
  id: string;
  title: string;
  author: string;
  url: string;
}

const VERA = 'vera.armishaw';

const v = (id: string, title: string): VideoRef => ({
  id,
  title,
  author: VERA,
  url: `https://www.tiktok.com/@${VERA}/video/${id}`,
});

/** Every video reference from the training plan, keyed for lookup by exercise. */
export const VIDEOS: Record<string, VideoRef> = {
  hipThrustTutorial: v('7333825575968165121', 'Hip thrust tutorial'),
  hipThrustFormTips: v('7475156218374311169', 'Hip thrust: 5 form tips'),
  singleLegHipThrust: v('7436978798467288328', 'Single leg hip thrust'),
  squatVariations: v('7458972600350395665', '3 dumbbell squat variations'),
  stepUpsDumbbell: v('7434837132260248839', 'Step-ups with dumbbell'),
  stepUpsTutorial: v('7418112464572747016', 'Step-ups tutorial'),
  reverseLungeGlutes: v('7329024160783518978', 'Reverse lunges, glute focus'),
  reverseLungeCue: v('7122311930684935425', 'Reverse lunge cue'),
  kickbackMistakes: v('7617999324399602964', 'Side glute kickback mistakes'),
  bulgarianAlternative: v('7625845760394906900', 'Bulgarian split squat alternative'),
  glutesNotLegs: v('7617179758962527508', 'Glutes without growing legs'),
};

export const ALL_VIDEOS: VideoRef[] = Object.values(VIDEOS);
