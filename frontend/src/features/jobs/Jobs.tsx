import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Search, MapPin, Bookmark, BookmarkPlus, Clock, DollarSign, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import SEOHead from "@/components/common/SEOHead";
import { useJobs, useSavedJobs, useToggleSave } from "@/hooks/useJobs";
import { useAuth } from "@/store/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@/types";

const ITEMS_PER_PAGE = 10;
const typeValue: Record<string, string> = { "Full-time": "full-time", "Part-time": "part-time", Contract: "contract", Internship: "internship" };
const levelValue: Record<string, string> = { Junior: "junior", Mid: "mid", Senior: "senior", Lead: "lead" };
const modeValue: Record<string, string> = { Remote: "remote", Hybrid: "hybrid", "On-site": "onsite" };

const formatSalary = (job: Job) => {
  const { min = 0, max = 0, currency = "USD" } = job.salary || {};
  if (!min && !max) return "Salary not specified";
  const formatter = new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 });
  return min && max ? `${formatter.format(min)} - ${formatter.format(max)}` : formatter.format(min || max);
};

const Jobs = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [locationQuery, setLocationQuery] = useState(searchParams.get("location") || "");
  const [sortBy, setSortBy] = useState("relevant");
  const [page, setPage] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState([0, 500]);

  const { data, isLoading, isError, error, refetch, isFetching } = useJobs({
    page,
    limit: ITEMS_PER_PAGE,
    keyword: searchQuery.trim() || undefined,
    location: locationQuery.trim() || undefined,
    type: selectedTypes.map((item) => typeValue[item]).join(",") || undefined,
    experience: selectedLevels.map((item) => levelValue[item]).join(",") || undefined,
    workMode: selectedModes.map((item) => modeValue[item]).join(",") || undefined,
    salaryMin: salaryRange[0] > 0 ? salaryRange[0] * 1000 : undefined,
    salaryMax: salaryRange[1] < 500 ? salaryRange[1] * 1000 : undefined,
    sort: sortBy === "salary-high" || sortBy === "salary-low" ? sortBy : undefined,
  });
  const isCandidate = isAuthenticated && user?.role === "candidate";
  const { data: savedJobs = [] } = useSavedJobs(isCandidate);
  const toggleSave = useToggleSave();
  const savedIds = useMemo(() => new Set(savedJobs.map((job) => job._id)), [savedJobs]);
  const jobs = data?.jobs || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || 1;

  const toggleFilter = (items: string[], value: string, setter: (next: string[]) => void) => {
    setter(items.includes(value) ? items.filter((item) => item !== value) : [...items, value]);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setLocationQuery("");
    setSelectedTypes([]);
    setSelectedLevels([]);
    setSelectedModes([]);
    setSalaryRange([0, 500]);
    setPage(1);
  };

  const handleSave = async (job: Job) => {
    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Sign in as a candidate to save jobs." });
      navigate("/login", { state: { from: `/jobs/${job._id}` } });
      return;
    }
    if (user?.role !== "candidate") {
      toast({ title: "Candidate access required", description: "Only candidates can save jobs.", variant: "destructive" });
      return;
    }
    try {
      const result = await toggleSave.mutateAsync(job._id);
      toast({ title: result.saved ? "Job saved!" : "Removed from saved jobs" });
    } catch (saveError) {
      toast({ title: "Could not update saved job", description: saveError instanceof Error ? saveError.message : "Please try again.", variant: "destructive" });
    }
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold">Job Type</h3>
        <div className="space-y-2">{Object.keys(typeValue).map((type) => (
          <div key={type} className="flex items-center gap-2">
            <Checkbox id={`type-${type}`} checked={selectedTypes.includes(type)} onCheckedChange={() => toggleFilter(selectedTypes, type, setSelectedTypes)} />
            <Label htmlFor={`type-${type}`} className="text-sm">{type}</Label>
          </div>
        ))}</div>
      </div>
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold">Experience Level</h3>
        <div className="space-y-2">{Object.keys(levelValue).map((level) => (
          <div key={level} className="flex items-center gap-2">
            <Checkbox id={`level-${level}`} checked={selectedLevels.includes(level)} onCheckedChange={() => toggleFilter(selectedLevels, level, setSelectedLevels)} />
            <Label htmlFor={`level-${level}`} className="text-sm">{level}</Label>
          </div>
        ))}</div>
      </div>
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold">Work Mode</h3>
        <div className="space-y-2">{Object.keys(modeValue).map((mode) => (
          <div key={mode} className="flex items-center gap-2">
            <Checkbox id={`mode-${mode}`} checked={selectedModes.includes(mode)} onCheckedChange={() => toggleFilter(selectedModes, mode, setSelectedModes)} />
            <Label htmlFor={`mode-${mode}`} className="text-sm">{mode}</Label>
          </div>
        ))}</div>
      </div>
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold">Salary Range</h3>
        <Slider value={salaryRange} onValueChange={(value) => { setSalaryRange(value); setPage(1); }} min={0} max={500} step={10} className="mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground"><span>${salaryRange[0]}K</span><span>${salaryRange[1]}K+</span></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Browse Jobs — OpportunityX" description="Find your next career opportunity. Search jobs by location, salary, type, and experience level." canonical="https://opportunityx.com/jobs" />
      <Navbar />
      <section className="border-b border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Job title, keyword, or company" value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setPage(1); }} className="pl-10" /></div>
            <div className="relative flex-1"><MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="City, state, or remote" value={locationQuery} onChange={(event) => { setLocationQuery(event.target.value); setPage(1); }} className="pl-10" /></div>
            <Button className="gradient-primary border-0" onClick={() => void refetch()} disabled={isFetching}>Search</Button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground"><strong className="text-foreground">{total}</strong> jobs found</p>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setPage(1); }}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="relevant">Most Relevant</SelectItem><SelectItem value="recent">Most Recent</SelectItem><SelectItem value="salary-high">Highest Salary</SelectItem><SelectItem value="salary-low">Lowest Salary</SelectItem></SelectContent>
              </Select>
              <Sheet><SheetTrigger asChild><Button variant="outline" size="icon" className="md:hidden"><SlidersHorizontal className="h-4 w-4" /></Button></SheetTrigger><SheetContent side="left"><SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader><div className="mt-6"><FilterSidebar /></div></SheetContent></Sheet>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden w-72 shrink-0 md:block"><div className="sticky top-24"><FilterSidebar /></div></aside>
          <div className="flex-1 space-y-4">
            {isLoading && Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-48 w-full rounded-xl" />)}
            {isError && <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center"><p className="font-medium">Unable to load jobs</p><p className="mt-1 text-sm text-muted-foreground">{error instanceof Error ? error.message : "Please try again."}</p><Button className="mt-4" variant="outline" onClick={() => void refetch()}>Try Again</Button></div>}
            {!isLoading && !isError && jobs.length === 0 && <div className="py-16 text-center"><p className="text-muted-foreground">No jobs match your search criteria.</p><Button variant="link" onClick={clearFilters}>Clear all filters</Button></div>}
            {!isLoading && !isError && jobs.map((job, index) => (
              <motion.div key={job._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                <Card className="group transition-all hover:border-primary/30 hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-sm font-bold text-primary">{job.company.slice(0, 2).toUpperCase()}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div><Link to={`/jobs/${job._id}`} className="font-display font-semibold transition-colors hover:text-primary">{job.title}</Link><p className="text-sm text-muted-foreground">{job.company}</p></div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary" onClick={() => void handleSave(job)} disabled={toggleSave.isPending}>{savedIds.has(job._id) ? <Bookmark className="h-4 w-4 fill-current" /> : <BookmarkPlus className="h-4 w-4" />}</Button>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span><span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {formatSalary(job)}</span><span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span></div>
                        <div className="mt-3 flex flex-wrap items-center gap-2"><Badge variant="secondary" className="text-xs capitalize">{job.jobType}</Badge><Badge variant="secondary" className="text-xs capitalize">{job.experienceLevel}</Badge><Badge className="bg-success/10 text-success hover:bg-success/20 text-xs capitalize">{job.workMode === "onsite" ? "On-site" : job.workMode}</Badge>{job.skills.map((skill) => <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>)}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end"><Button size="sm" className="gradient-primary border-0 text-xs" asChild><Link to={`/jobs/${job._id}`}>View & Apply</Link></Button></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {!isLoading && !isError && totalPages > 1 && <div className="flex items-center justify-center gap-2 pt-6"><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>{Array.from({ length: totalPages }, (_, index) => <Button key={index + 1} variant={page === index + 1 ? "default" : "outline"} size="sm" className="hidden sm:inline-flex" onClick={() => setPage(index + 1)}>{index + 1}</Button>)}<span className="text-sm text-muted-foreground sm:hidden">Page {page} of {totalPages}</span><Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button></div>}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Jobs;
