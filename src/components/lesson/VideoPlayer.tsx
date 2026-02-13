// VideoPlayer - YouTube embed component for lessons
interface VideoPlayerProps {
  videoId: string;
  title: string;
}

export default function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-hextech-gold/30">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-hextech-gold z-10" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-hextech-gold z-10" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-hextech-gold z-10" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-hextech-gold z-10" />
      
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
