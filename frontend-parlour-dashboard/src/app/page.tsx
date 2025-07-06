import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Clock, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Parlour Admin
            <span className="text-gradient block">Dashboard</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive business management platform with role-based access control 
            and real-time attendance tracking for modern parlour operations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="card-gradient">
            <CardHeader>
              <Shield className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Secure authentication with Super Admin and Admin roles
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-gradient">
            <CardHeader>
              <Users className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Employee Management</CardTitle>
              <CardDescription>
                Complete employee lifecycle management and tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-gradient">
            <CardHeader>
              <Clock className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Real-time Attendance</CardTitle>
              <CardDescription>
                Live punch in/out tracking with WebSocket updates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-gradient">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Assign, track, and manage tasks with priority levels
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              Access Dashboard
            </Button>
          </Link>
          <Link href="/attendance">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Employee Punch In/Out
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Super Admin Access</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Full Admin Access
              </p>
              <div className="space-y-2 text-sm">
                <div>Email: superadmin@parlour.com</div>
                <div>Password: password123</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Admin Access</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Limited Admin Access
              </p>
              <div className="space-y-2 text-sm">
                <div>Email: admin@parlour.com</div>
                <div>Password: password123</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Technology Stack</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-sm">
                <div>Next.js 15 + TypeScript</div>
                <div>Node.js + MongoDB</div>
                <div>Socket.IO + TailwindCSS</div>
                <div>Docker + ShadCN UI</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
