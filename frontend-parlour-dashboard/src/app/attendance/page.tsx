'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, User, CheckCircle, XCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { apiService } from '@/lib/api'
import { socketService } from '@/lib/socket'
import { PunchData, Attendance, SocketAttendanceUpdate } from '@/types'
import { formatTime } from '@/lib/utils'

export default function AttendancePage() {
  const [employeeId, setEmployeeId] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([])
  const [lastPunch, setLastPunch] = useState<Attendance | null>(null)

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch today's attendance
  useEffect(() => {
    fetchTodayAttendance()
  }, [])

  // Socket connection for real-time updates
  useEffect(() => {
    const handleAttendanceUpdate = (data: SocketAttendanceUpdate) => {
      setTodayAttendance(prev => {
        const existingIndex = prev.findIndex(att => att._id === data.attendance._id)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = data.attendance
          return updated
        } else {
          return [...prev, data.attendance]
        }
      })
    }

    socketService.connect()
    socketService.onAttendanceUpdate(handleAttendanceUpdate)

    return () => {
      socketService.offAttendanceUpdate(handleAttendanceUpdate)
    }
  }, [])

  const fetchTodayAttendance = async () => {
    try {
      const response = await apiService.getTodayAttendance()
      if (response.success && response.data) {
        setTodayAttendance(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch today\'s attendance:', error)
    }
  }

  const handlePunch = async (type: 'in' | 'out') => {
    if (!employeeId.trim()) {
      setError('Please enter your Employee ID')
      return
    }

    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      const punchData: PunchData = {
        employeeId: employeeId.trim(),
        type,
        notes: notes.trim() || undefined
      }

      const response = type === 'in' 
        ? await apiService.punchIn(punchData)
        : await apiService.punchOut(punchData)

      if (response.success && response.data) {
        setLastPunch(response.data)
        setMessage(`Successfully punched ${type}! ${response.message}`)
        setNotes('')
        
        // Refresh today's attendance
        fetchTodayAttendance()
      } else {
        setError(response.message || `Failed to punch ${type}`)
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while punching ${type}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getEmployeeStatus = (empId: string) => {
    const empAttendance = todayAttendance.find(att => att.employeeId === empId)
    if (!empAttendance) return 'Not punched in'
    if (empAttendance.punchOut) return 'Punched out'
    return 'Punched in'
  }

  const canPunchIn = (empId: string) => {
    const empAttendance = todayAttendance.find(att => att.employeeId === empId)
    return !empAttendance || empAttendance.punchOut
  }

  const canPunchOut = (empId: string) => {
    const empAttendance = todayAttendance.find(att => att.employeeId === empId)
    return empAttendance && empAttendance.punchIn && !empAttendance.punchOut
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Employee Attendance
            </h1>
          </div>
          
          <div className="flex items-center gap-2 text-lg font-mono">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-gray-700 dark:text-gray-300">
              {formatTime(currentTime)} - {currentTime.toDateString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Punch In/Out Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Punch In/Out
              </CardTitle>
              <CardDescription>
                Enter your employee ID to record your attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  type="text"
                  placeholder="Enter your employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  disabled={isLoading}
                />
                {employeeId && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status: {getEmployeeStatus(employeeId)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="Add any notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => handlePunch('in')}
                  disabled={isLoading || !employeeId || !canPunchIn(employeeId)}
                  className="flex-1"
                  variant="default"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Punch In
                </Button>

                <Button
                  onClick={() => handlePunch('out')}
                  disabled={isLoading || !employeeId || !canPunchOut(employeeId)}
                  className="flex-1"
                  variant="outline"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Punch Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Today's Attendance */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>
                Real-time attendance tracking for all employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAttendance.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No attendance records for today
                  </p>
                ) : (
                  todayAttendance.map((attendance) => (
                    <div
                      key={attendance._id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {attendance.employee?.name || `Employee ${attendance.employeeId}`}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ID: {attendance.employeeId}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {attendance.punchIn && (
                            <span className="text-green-600 text-sm">
                              In: {formatTime(new Date(attendance.punchIn))}
                            </span>
                          )}
                          {attendance.punchOut && (
                            <span className="text-red-600 text-sm">
                              Out: {formatTime(new Date(attendance.punchOut))}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {attendance.hoursWorked.toFixed(1)} hours
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 