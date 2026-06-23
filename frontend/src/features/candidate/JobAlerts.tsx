import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

const JobAlerts = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Job Alerts" description="Get notified when new jobs match your criteria" />
      <EmptyState icon={Bell} title="Job alerts are coming soon" description="Persistent job alerts and delivery preferences are planned for a future phase. No fake alerts are stored locally." />
    </motion.div>
  );
};

export default JobAlerts;
