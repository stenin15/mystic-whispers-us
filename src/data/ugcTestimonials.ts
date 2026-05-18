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
    posterSrc: "/ugc/ugc-vanessa-poster.jpg",
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
    posterSrc: "/ugc/ugc-dorothy-poster.jpg",
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
    posterSrc: "/ugc/ugc-gabriela-poster.jpg",
    transcript:
      "The part about my love timing window — I'd just started talking to someone new and the reading described exactly what I was feeling about him. Chills.",
  },
];
