import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Baby, User, FileText, Check, Upload, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

type Step = 1 | 2 | 3;

export default function RegisterChild() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const childId = searchParams.get('childId');
  const isEditing = !!childId;

  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Child data
  const [childName, setChildName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');

  // Parent data
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentAadhaar, setParentAadhaar] = useState('');

  // Document
  const [birthCertificate, setBirthCertificate] = useState<File | null>(null);

  // Fetch existing data if editing
  useEffect(() => {
    const fetchChildData = async () => {
      if (!childId || !user) return;
      setIsLoading(true);
      try {
        const docRef = doc(db, 'children', childId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setChildName(data.name || '');
          setDateOfBirth(data.dateOfBirth || '');
          setGender(data.gender || 'male');

          setParentName(user.name || '');
          setParentPhone(user.phone || '');
          setParentEmail(user.email || '');
          setParentAadhaar(user.aadhaar || '');
        } else {
          toast({
            title: "Error",
            description: "Child record not found.",
            variant: "destructive"
          });
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error fetching child data:", error);
        toast({
          title: "Error",
          description: "Failed to load child data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isEditing) {
      fetchChildData();
    } else if (user) {
      setParentName(user.name || '');
      setParentPhone(user.phone || '');
      setParentEmail(user.email || '');
      setParentAadhaar(user.aadhaar || '');
    }
  }, [childId, user, toast, navigate, isEditing]);


  const steps = [
    { number: 1, title: 'Child Info', icon: Baby },
    { number: 2, title: 'Parent Info', icon: User },
    { number: 3, title: 'Documents', icon: FileText },
  ];

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const childData: { [key: string]: string | undefined } = {
        name: childName,
        dateOfBirth: dateOfBirth,
        gender: gender,
        parentId: user.id,
        ...(isEditing ? { updatedAt: new Date().toISOString() } : { createdAt: new Date().toISOString() }),
      };

      if (birthCertificate) {
        try {
          const storageRef = ref(storage, `birth_certificates/${user.id}/${Date.now()}_${birthCertificate.name}`);
          const snapshot = await uploadBytes(storageRef, birthCertificate);
          const url = await getDownloadURL(snapshot.ref);
          childData.birthCertificateUrl = url;
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          toast({
            title: "Upload Failed",
            description: "Failed to upload birth certificate, but continuing with registration.",
            variant: "destructive"
          });
        }
      }

      if (isEditing && childId) {
        await updateDoc(doc(db, 'children', childId), childData);
        toast({
          title: 'Child Updated!',
          description: `${childName}'s information has been updated.`,
        });
      } else {
        await addDoc(collection(db, 'children'), childData);
        toast({
          title: 'Child Registered!',
          description: `${childName} has been successfully registered.`,
        });
      }

      if (parentAadhaar && user.aadhaar !== parentAadhaar) {
        try {
          await updateDoc(doc(db, 'users', user.id), { aadhaar: parentAadhaar });
        } catch (err) {
          console.error("Failed to update parent profile with aadhaar", err);
        }
      }

      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving document: ", error);
      const message = error instanceof Error ? error.message : 'Please try again.';
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'register'} child. ${message}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBirthCertificate(e.target.files[0]);
    }
  };

  if (isLoading && isEditing && step === 1 && !childName) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 blur-xl opacity-30 animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, hsla(250, 84%, 60%, 0.4) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, hsla(172, 66%, 50%, 0.3) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 hero-card rounded-none px-6 pt-6 pb-20">
        <Button
          variant="ghost"
          size="icon"
          className="text-white/80 hover:text-white hover:bg-white/10 mb-4 rounded-xl"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            {isEditing ? 'Edit Mode' : 'New Registration'}
          </Badge>
        </div>

        <h1 className="text-3xl font-display font-bold text-white">
          {isEditing ? 'Edit Child' : 'Register Child'}
        </h1>
        <p className="text-white/80 mt-1">
          {isEditing ? 'Update your child\'s information' : 'Add your newborn\'s information'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="relative z-10 px-6 -mt-10 mb-6">
        <Card className="p-5 card-glass border-0 shadow-card">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${step >= s.number
                        ? 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30'
                        : 'bg-slate-100 text-slate-400'
                      }`}
                  >
                    {step > s.number ? (
                      <Check className="h-6 w-6 animate-scale-in" />
                    ) : (
                      <s.icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-semibold transition-colors ${step >= s.number ? 'text-violet-600' : 'text-slate-400'
                    }`}>
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="relative h-1 w-12 mx-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500 ${step > s.number ? 'w-full' : 'w-0'
                        }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Form Content */}
      <div className="relative z-10 px-6 pb-8">
        <Card className="p-6 card-glass border-0 shadow-card animate-fade-in">
          {step === 1 && (
            <div className="space-y-5 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                  <Baby className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground">
                    Child Information
                  </h2>
                  <p className="text-sm text-muted-foreground">Enter your child's details</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="childName" className="text-slate-700 font-medium">Child's Full Name</Label>
                <Input
                  id="childName"
                  placeholder="Enter child's name"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  required
                  className="h-12 rounded-xl border-slate-200 bg-white/80 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob" className="text-slate-700 font-medium">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  className="h-12 rounded-xl border-slate-200 bg-white/80 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">Gender</Label>
                <RadioGroup
                  value={gender}
                  onValueChange={(value) => setGender(value as 'male' | 'female' | 'other')}
                  className="flex gap-3"
                >
                  {['male', 'female', 'other'].map((g) => (
                    <div
                      key={g}
                      className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${gender === g
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-slate-200 bg-white hover:border-violet-200'
                        }`}
                    >
                      <RadioGroupItem value={g} id={g} className="text-violet-600" />
                      <Label htmlFor={g} className="font-medium cursor-pointer capitalize">{g}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground">
                    Parent/Guardian Information
                  </h2>
                  <p className="text-sm text-muted-foreground">Your contact details</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentName" className="text-slate-700 font-medium">Parent's Full Name</Label>
                <Input
                  id="parentName"
                  placeholder="Enter your name"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  required
                  className="h-12 rounded-xl border-slate-200 bg-white/80 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parentPhone" className="text-slate-700 font-medium">Contact Number</Label>
                  <Input
                    id="parentPhone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    required
                    className="h-12 rounded-xl border-slate-200 bg-white/80 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentEmail" className="text-slate-700 font-medium">Email</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    placeholder="email@example.com"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl border-slate-200 bg-white/80 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentAadhaar" className="text-slate-700 font-medium">
                  Aadhaar Number <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input
                  id="parentAadhaar"
                  type="text"
                  placeholder="12-digit Aadhaar number"
                  value={parentAadhaar}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 12) setParentAadhaar(val);
                  }}
                  className="h-12 rounded-xl border-slate-200 bg-white/80 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground">
                    Birth Certificate
                  </h2>
                  <p className="text-sm text-muted-foreground">Upload supporting document (optional)</p>
                </div>
              </div>

              <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${birthCertificate
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-slate-200 bg-slate-50/50 hover:border-violet-300 hover:bg-violet-50/30'
                }`}>
                {birthCertificate ? (
                  <div className="space-y-3 animate-scale-in">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    <p className="font-semibold text-slate-900">{birthCertificate.name}</p>
                    <p className="text-sm text-emerald-600">File uploaded successfully</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBirthCertificate(null)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-100 to-gray-100 flex items-center justify-center mx-auto">
                      <Upload className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">
                        Drag & drop or click to upload
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Supports PDF, JPG, PNG (max 10MB)
                      </p>
                    </div>
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer rounded-xl border-violet-200 text-violet-600 hover:bg-violet-50" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center bg-slate-50 p-3 rounded-xl">
                💡 You can skip this step and upload the document later from your profile
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="flex-1 h-12 btn-premium rounded-xl text-white"
                disabled={
                  (step === 1 && (!childName || !dateOfBirth)) ||
                  (step === 2 && (!parentName || !parentPhone || !parentEmail))
                }
              >
                Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex-1 h-12 btn-premium rounded-xl text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Registering...'}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Child' : 'Complete Registration'}
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
