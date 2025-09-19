import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, PlayCircle } from "lucide-react"
import type { VideoResource } from "@shared/schema"

interface TabbedVideoSectionProps {
  videos: VideoResource[];
  sectionId: string;
  isCompleted: boolean;
  isAccessible: boolean;
  onMarkComplete: (sectionId: string) => void;
}

export function TabbedVideoSection({
  videos,
  sectionId,
  isCompleted,
  isAccessible,
  onMarkComplete
}: TabbedVideoSectionProps) {
  // Show locked state if section is not accessible
  if (!isAccessible) {
    return (
      <Card className="p-6 opacity-60">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-grey-500" />
            <h3 className="text-lg font-semibold text-grey-600">Video Content</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-grey-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-grey-300 rounded-sm"></div>
            </div>
            <span className="text-sm text-grey-500">Locked</span>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="w-12 h-12 bg-grey-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 bg-grey-400 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-grey-300 rounded-sm"></div>
            </div>
          </div>
          <p className="text-grey-600 mb-2">Complete the previous activity to unlock this video</p>
          <p className="text-sm text-grey-500">Activities must be completed in sequential order</p>
        </div>
      </Card>
    )
  }

  if (!videos || videos.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">No videos available for this section</p>
      </Card>
    )
  }

  const handleMarkComplete = () => {
    onMarkComplete(sectionId)
  }

  return (
    <Card className="overflow-hidden">
      <Tabs defaultValue="video-0" className="w-full">
        <div className="border-b bg-muted/50 px-6 pt-4">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${videos.length}, 1fr)` }}>
            {videos.map((video, index) => (
              <TabsTrigger 
                key={index} 
                value={`video-${index}`}
                className="flex items-center gap-2"
                data-testid={`trigger-video-${index}`}
              >
                <PlayCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Video {index + 1}</span>
                <span className="sm:hidden">{index + 1}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {videos.map((video, index) => (
          <TabsContent 
            key={index} 
            value={`video-${index}`} 
            className="p-0 m-0"
          >
            <div className="p-6 space-y-4">
              {/* Video Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold flex-1">{video.title}</h3>
                  {video.duration && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </Badge>
                  )}
                </div>
                {video.description && (
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                )}
              </div>

              {/* Video Embed */}
              <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                {video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={video.videoUrl}
                    title={video.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={video.videoUrl}
                    controls
                    className="absolute inset-0 w-full h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              {/* Complete Button - Only show on last video */}
              {index === videos.length - 1 && (
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleMarkComplete}
                    disabled={isCompleted}
                    variant={isCompleted ? "outline" : "default"}
                    data-testid="button-mark-videos-complete"
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Videos Watched
                      </>
                    ) : (
                      'Mark Videos as Complete'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  )
}