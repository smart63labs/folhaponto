import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

type Variant = 'success' | 'error' | 'warning' | 'info'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  variant?: Variant
}

const iconMap: Record<Variant, React.ReactNode> = {
  success: <CheckCircle className="w-6 h-6 text-green-600" />,
  error: <XCircle className="w-6 h-6 text-red-600" />,
  warning: <AlertCircle className="w-6 h-6 text-yellow-600" />,
  info: <Info className="w-6 h-6 text-blue-600" />,
}

const titleClassMap: Record<Variant, string> = {
  success: 'text-green-700',
  error: 'text-red-700',
  warning: 'text-yellow-700',
  info: 'text-blue-700',
}

const NotificationModal: React.FC<Props> = ({ isOpen, onClose, title, description, variant = 'info' }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${titleClassMap[variant]}`}>
            {iconMap[variant]}
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button onClick={onClose}>OK</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NotificationModal