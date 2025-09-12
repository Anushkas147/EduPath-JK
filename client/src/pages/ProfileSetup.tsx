import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const profileSchema = z.object({
  age: z.number().min(15).max(25).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  currentClass: z.enum(['10', '12', 'graduate']).optional(),
  academicScore: z.number().min(0).max(100).optional(),
  location: z.string().min(1).optional(),
  interests: z.array(z.string()).optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

const districts = [
  'srinagar', 'jammu', 'anantnag', 'baramulla', 'kathua', 
  'udhampur', 'doda', 'rajouri', 'poonch', 'pulwama',
  'kupwara', 'sopore', 'handwara', 'ramban'
];

const interestOptions = [
  'science', 'mathematics', 'arts', 'commerce', 'technology', 
  'medicine', 'engineering', 'literature', 'history', 'sports'
];

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      interests: [],
    },
  });

  const currentClass = watch("currentClass");

  const mutation = useMutation({
    mutationFn: async (data: ProfileData) => {
      await apiRequest("POST", "/api/profile", { ...data, interests: selectedInterests });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileData) => {
    mutation.mutate(data);
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      setSelectedInterests([...selectedInterests, interest]);
    } else {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    }
  };

  const progress = 60; // Base progress, you can calculate this based on filled fields

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-profile-setup-title">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground">Help us personalize your experience</p>
          </div>

          <Card>
            <CardHeader>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Profile Completion</span>
                  <span className="text-sm text-muted-foreground" data-testid="text-progress-percent">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="w-full" data-testid="progress-profile-completion" />
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="form-profile-setup">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="age" className="text-sm font-medium text-foreground">
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min="15"
                      max="25"
                      placeholder="Enter your age"
                      {...register("age", { valueAsNumber: true })}
                      data-testid="input-age"
                    />
                    {errors.age && (
                      <p className="text-sm text-destructive mt-1">{errors.age.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gender" className="text-sm font-medium text-foreground">
                      Gender
                    </Label>
                    <Select
                      onValueChange={(value) => setValue("gender", value as any)}
                      data-testid="select-gender"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-sm text-destructive mt-1">{errors.gender.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="currentClass" className="text-sm font-medium text-foreground">
                      Current Class
                    </Label>
                    <Select
                      onValueChange={(value) => setValue("currentClass", value as any)}
                      data-testid="select-class"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">Class 10th</SelectItem>
                        <SelectItem value="12">Class 12th</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.currentClass && (
                      <p className="text-sm text-destructive mt-1">{errors.currentClass.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="academicScore" className="text-sm font-medium text-foreground">
                      Academic Score
                      {currentClass === "10" && " (Percentage)"}
                      {currentClass === "12" && " (Percentile)"}
                    </Label>
                    <Input
                      id="academicScore"
                      type="number"
                      min="0"
                      max="100"
                      placeholder={
                        currentClass === "10" 
                          ? "Enter percentage" 
                          : currentClass === "12" 
                          ? "Enter percentile" 
                          : "Enter score"
                      }
                      {...register("academicScore", { valueAsNumber: true })}
                      data-testid="input-academic-score"
                    />
                    {errors.academicScore && (
                      <p className="text-sm text-destructive mt-1">{errors.academicScore.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-foreground">
                    Location (District)
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("location", value)}
                    data-testid="select-location"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district.charAt(0).toUpperCase() + district.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location && (
                    <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-3 block">
                    Academic Interests
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {interestOptions.map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <Checkbox
                          id={interest}
                          checked={selectedInterests.includes(interest)}
                          onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                          data-testid={`checkbox-interest-${interest}`}
                        />
                        <Label htmlFor={interest} className="text-sm cursor-pointer">
                          {interest.charAt(0).toUpperCase() + interest.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  data-testid="button-complete-profile"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating Profile...
                    </>
                  ) : (
                    "Complete Profile & Continue"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
