import { FormMockInterview } from "@/components/MockInterview/form-mock-interview";
import { Interview } from "@/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const CreateEditPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchInterview = async () => {
      if (interviewId && interviewId !== 'create') {
        try {
          const token = getToken();
          const res = await fetch(`http://localhost:5000/api/interviews/${interviewId}`, {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          });
          if (!res.ok) return;
          const data = await res.json();
          setInterview({
            id: data._id,
            position: data.position,
            description: data.description,
            experience: data.experience,
            userId: data.userId,
            techStack: data.techStack,
            questions: data.questions || [],
            createdAt: data.createdAt,
            updateAt: data.updatedAt,
          } as unknown as Interview);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchInterview();
  }, [interviewId, getToken]);

  return (
    <div className="my-4 flex-col w-full">
      <FormMockInterview initialData={interview} />
    </div>
  );
};

export default CreateEditPage;
