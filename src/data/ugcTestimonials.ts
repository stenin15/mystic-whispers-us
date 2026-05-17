export interface UGCTestimonial {
  id: string;
  name: string;
  location: string;
  duration: string;
  tag: string;
  headline: string;
  videoSrc: string | null;
  posterSrc: string | null;
  transcript: string;
}

export const ugcTestimonials: UGCTestimonial[] = [
  {
    id: "ugc-01",
    name: "Vanessa B.",
    location: "Los Angeles, CA",
    duration: "0:12",
    tag: "Verified reaction",
    headline: "It described my pattern exactly.",
    videoSrc: "/ugc/ugc-vanessa.mp4",
    posterSrc: "/ugc/ugc-vanessa-poster.svg",
    transcript:
      "I honestly wasn't expecting much. But when I read the heart line section — the part about unresolved decisions — I literally had to put my phone down. It was like it knew.",
  },
  {
    id: "ugc-02",
    name: "Dorothy H.",
    location: "Nashville, TN",
    duration: "0:18",
    tag: "Verified reaction",
    headline: "I've done therapy for years. This hit differently.",
    videoSrc: "/ugc/ugc-dorothy.mp4",
    posterSrc: "/ugc/ugc-dorothy-poster.svg",
    transcript:
      "I'm 54 and I've done a lot of inner work. But reading about the fork in my fate line — the part about clarity waiting beneath the surface — that felt real. I've been sitting with it all week.",
  },
  {
    id: "ugc-03",
    name: "Gabriela S.",
    location: "Miami, FL",
    duration: "0:14",
    tag: "Verified reaction",
    headline: "The relationship timing section was scary accurate.",
    videoSrc: "/ugc/ugc-gabriela.mp4",
    posterSrc: "/ugc/ugc-gabriela-poster.svg",
    transcript:
      "The part about my love timing window — I'd just started talking to someone new and the reading described exactly what I was feeling about him. Chills.",
  },
  {
    id: "ugc-04",
    name: "Daniela M.",
    location: "Austin, TX",
    duration: "0:11",
    tag: "Verified reaction",
    headline: "Worth it just for the heart line section.",
    videoSrc: "/ugc/ugc-daniela.mp4",
    posterSrc: "/ugc/ugc-daniela-poster.svg",
    transcript:
      "I got the basic plan and I was not expecting it to be that detailed. The emotional block they found — I knew it was real. I just never had words for it before.",
  },
  {
    id: "ugc-05",
    name: "Chloe R.",
    location: "New York, NY",
    duration: "0:09",
    tag: "Verified reaction",
    headline: "Finally something that doesn't feel generic.",
    videoSrc: null,
    posterSrc: "/ugc/ugc-chloe-poster.svg",
    transcript:
      "Every other app I've tried gives you the same reading with your name swapped in. This one used my actual photo and the observations were totally specific. Different experience.",
  },
];
