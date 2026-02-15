import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import FileUpload from "@/components/common/FileUpload";

const ResumeUpload = () => {
  const [resume, setResume] = useState<{ name: string; uploadedAt?: string } | null>(null);
  const [parsing, setParsing] = useState(false);

  const handleUpload = (file: File) => {
    // API call: const formData = new FormData(); formData.append("resume", file); api.upload("/candidate/resume", formData);
    setResume({ name: file.name, uploadedAt: "Just now" });
  };

  const handleParse = async () => {
    setParsing(true);
    // API call: api.post("/candidate/resume/parse")
    await new Promise((r) => setTimeout(r, 2000));
    setParsing(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Resume" description="Upload your resume to apply to jobs faster" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" /> Upload Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            accept=".pdf,.doc,.docx"
            maxSize={10}
            onFileSelect={handleUpload}
            onRemove={() => setResume(null)}
            currentFile={resume}
            label="Drop your resume here"
          />
        </CardContent>
      </Card>

      {resume && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-accent" /> AI Resume Parsing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Our AI can extract your skills, experience, and education from your resume and auto-fill your profile.
            </p>
            <Button onClick={handleParse} disabled={parsing} className="gradient-primary border-0">
              <Sparkles className="mr-2 h-4 w-4" />
              {parsing ? "Parsing..." : "Parse Resume with AI"}
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default ResumeUpload;
