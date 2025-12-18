import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useHandReadingStore } from '@/store/useHandReadingStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredFields?: ('name' | 'age' | 'handPhotoURL' | 'quizAnswers' | 'analysisResult')[];
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  requiredFields = ['name'],
  redirectTo = '/formulario',
}: ProtectedRouteProps) => {
  const store = useHandReadingStore();

  const isValid = requiredFields.every((field) => {
    switch (field) {
      case 'name':
        return !!store.name;
      case 'age':
        return !!store.age;
      case 'handPhotoURL':
        return !!store.handPhotoURL;
      case 'quizAnswers':
        return store.quizAnswers.length >= 5;
      case 'analysisResult':
        return !!store.analysisResult;
      default:
        return true;
    }
  });

  if (!isValid) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
