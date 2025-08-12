import { Headings } from "@/components/MockInterview/Headings";
import { InterviewPin } from "@/components/MockInterview/pin";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { Interview } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/MockInterview/Header";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export const InterviewDashboard = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, getToken, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const token = getToken();
        console.log("User ID:", user?.id);
        console.log("Token exists:", !!token);
        
        // First check if server is accessible
        try {
          const healthCheck = await fetch('http://localhost:5000/health');
          console.log("Server health check:", healthCheck.ok);
          if (!healthCheck.ok) {
            throw new Error(`Server health check failed: ${healthCheck.status}`);
          }
        } catch (error) {
          console.error("Server not accessible:", error);
          toast.error("Server Error", {
            description: "Cannot connect to server. Please check if server is running.",
          });
          setLoading(false);
          return;
        }
        
        const params = user?.id ? `?userId=${encodeURIComponent(user.id)}` : "";
        const res = await fetch(`http://localhost:5000/api/interviews${params}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) {
          console.error("HTTP Error:", res.status, res.statusText);
          throw new Error(`Failed to fetch interviews: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        console.log("API Response:", data);
        const list: Interview[] = (Array.isArray(data) ? data : data.data || []).map(
          (item: {
            _id?: string;
            id?: string;
            position: string;
            description: string;
            experience: number;
            userId: string;
            techStack: string;
            questions?: { question: string; answer: string }[];
            createdAt: string | Date;
            updatedAt?: string | Date;
            updateAt?: string | Date;
          }) => ({
            id: item._id ?? item.id,
            position: item.position,
            description: item.description,
            experience: item.experience,
            userId: item.userId,
            techStack: item.techStack,
            questions: item.questions || [],
            createdAt: item.createdAt,
            updatedAt: item.updatedAt ?? item.updateAt,
          })
        );
        console.log("Processed interviews list:", list);
        console.log("List length:", list.length);
        setInterviews(list);
      } catch (error) {
        console.error("Error on fetching : ", error);
        toast.error("Error..", {
          description: "Something went wrong. Try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && isAuthenticated) {
      fetchInterviews();
    } else if (!isAuthenticated) {
      console.log("User not authenticated, skipping fetch");
    }
  }, [user?.id, isAuthenticated]);

  return (
    <>
    <Header/>
      <div className="flex w-full items-center justify-between mt-6 p-3">
        {/* headings */}
        <Headings
          title="Dashboard"
          description="Create and start you AI Mock interview"
        />
        <Link to={"/generate/create"}>
          <Button size={"sm"}>
            <Plus /> Add New
          </Button>
        </Link>
      </div>

      <Separator className="my-8" />
      {/* content section */}

      <div className="md:grid md:grid-cols-3 gap-3 py-2 my-2 mx-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 md:h-32 rounded-md" />
          ))
        ) : interviews.length > 0 ? (
          interviews.map((interview) => (
            <InterviewPin key={interview.id} interview={interview} />
          ))
        ) : (
          <div className="md:col-span-3 w-full flex flex-grow items-center justify-center h-96 flex-col">
            <img
              src="/assets/svg/not-found.svg"
              className="w-44 h-44 object-contain"
              alt=""
            />

            <h2 className="text-lg font-semibold text-muted-foreground">
              No Data Found
            </h2>

            <p className="w-full md:w-96 text-center text-sm text-neutral-400 mt-4">
              There is no available data to show. Please add some new mock
              interviews
            </p>

            <Link to={"/generate/create"} className="mt-4">
              <Button size={"sm"}>
                <Plus className="min-w-5 min-h-5 mr-1" />
                Add New
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default InterviewDashboard;


