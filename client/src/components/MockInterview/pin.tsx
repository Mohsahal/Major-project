import { Interview } from "@/types";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TooltipButton } from "./tooltip-button";
import { Eye, Newspaper, Sparkles } from "lucide-react";

interface InterviewPinProps {
  interview: Interview;
  onMockPage?: boolean;
}

export const InterviewPin = ({
  interview,
  onMockPage = false,
}: InterviewPinProps) => {
  const navigate = useNavigate();

  return (
    <Card className="p-4 rounded-md shadow-none hover:shadow-md shadow-gray-100 cursor-pointer transition-all space-y-4">
      <CardTitle className="text-lg">{interview?.position}</CardTitle>
      <CardDescription>{interview?.description}</CardDescription>
      <div className="w-full flex items-center gap-2 flex-wrap">
        {interview?.techStack.split(",").map((word, index) => (
          <Badge
            key={index}
            variant={"outline"}
            className="text-xs text-muted-foreground hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-900"
          >
            {word}
          </Badge>
        ))}
      </div>

      <CardFooter
        className={cn(
          "w-full flex items-center p-0",
          onMockPage ? "justify-end" : "justify-between"
        )}
      >
                 <p className="text-[12px] text-muted-foreground truncate whitespace-nowrap">
           {(() => {
             if (!interview?.createdAt) return "Date not available";
             try {
               const createdAtDate = new Date(interview.createdAt);
               if (isNaN(createdAtDate.getTime())) return "Invalid date";
               const date = createdAtDate.toLocaleDateString("en-US", {
                 dateStyle: "long",
               });
               const time = createdAtDate.toLocaleTimeString("en-US", {
                 timeStyle: "short",
               });
               return `${date} - ${time}`;
             } catch (error) {
               return "Date not available";
             }
           })()}
         </p>

        {!onMockPage && (
          <div className="flex items-center justify-center">
                         <TooltipButton
               content="View"
               buttonVariant={"ghost"}
               onClick={() => {
                 navigate(`/generate/${interview?.id}`, { replace: true });
               }}
               disabled={false}
               buttonClassName="hover:text-sky-500"
               icon={<Eye />}
               loading={false}
             />

             <TooltipButton
               content="Feedback"
               buttonVariant={"ghost"}
               onClick={() => {
                 navigate(`/generate/feedback/${interview?.id}`, {
                   replace: true,
                 });
               }}
               disabled={false}
               buttonClassName="hover:text-yellow-500"
               icon={<Newspaper />}
               loading={false}
             />

             <TooltipButton
               content="Start"
               buttonVariant={"ghost"}
               onClick={() => {
                 navigate(`/generate/interview/${interview?.id}`, {
                   replace: true,
                 });
               }}
               disabled={false}
               buttonClassName="hover:text-sky-500"
               icon={<Sparkles />}
               loading={false}
             />
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
