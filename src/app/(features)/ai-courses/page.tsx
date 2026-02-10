'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  Play, Pause, Clock, BookOpen, Award, Star, Users, Code, MonitorPlay, Brain, Database, Network, MessageSquare
} from 'lucide-react'

const courseIcons: Record<string, React.ElementType> = {
  python: Code,
  react: MonitorPlay,
  ml: Brain,
  sql: Database,
  system: Network,
  comm: MessageSquare,
}

const courses = [
  { id: 1, title: 'Python for Data Science', category: 'Programming', duration: '12h', lessons: 48, rating: 4.8, students: 12400, progress: 65, color: '#1E40AF', iconKey: 'python' },
  { id: 2, title: 'React & Next.js Mastery', category: 'Web Development', duration: '16h', lessons: 62, rating: 4.9, students: 8900, progress: 30, color: '#1E40AF', iconKey: 'react' },
  { id: 3, title: 'Machine Learning A-Z', category: 'AI/ML', duration: '20h', lessons: 85, rating: 4.7, students: 15600, progress: 0, color: '#166534', iconKey: 'ml' },
  { id: 4, title: 'SQL & Database Design', category: 'Databases', duration: '8h', lessons: 32, rating: 4.6, students: 9200, progress: 100, color: '#92400E', iconKey: 'sql' },
  { id: 5, title: 'System Design Interview', category: 'Interview Prep', duration: '10h', lessons: 40, rating: 4.9, students: 18000, progress: 15, color: '#991B1B', iconKey: 'system' },
  { id: 6, title: 'Communication Skills', category: 'Soft Skills', duration: '6h', lessons: 24, rating: 4.5, students: 6800, progress: 0, color: '#374151', iconKey: 'comm' },
]

const categories = ['All', 'Programming', 'Web Development', 'AI/ML', 'Databases', 'Interview Prep', 'Soft Skills']

export default function AICoursesPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const filteredCourses = activeCategory === 'All'
    ? courses
    : courses.filter((c) => c.category === activeCategory)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">AI Video Courses</h1>
          <p className="text-gray-500">Learn from AI-powered interactive courses</p>
        </motion.div>

        <motion.div
          className="flex gap-2 mb-8 overflow-x-auto pb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200 border ${
                activeCategory === cat
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" layout>
          <AnimatePresence>
            {filteredCourses.map((course, index) => {
              const IconComp = courseIcons[course.iconKey] || Code
              return (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="h-44 relative flex items-center justify-center bg-gray-50">
                    <IconComp size={48} className="text-gray-300" />

                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-800">
                        <Play size={20} fill="white" className="text-white ml-0.5" />
                      </div>
                    </div>

                    {course.progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                        <div className="h-full rounded-r bg-blue-800" style={{ width: `${course.progress}%` }} />
                      </div>
                    )}

                    {course.progress === 100 && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-bold border border-green-200">
                        COMPLETED
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100">
                        {course.category}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-amber-600">
                        <Star size={10} fill="currentColor" />
                        {course.rating}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-800 transition-colors">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={11} /> {course.duration}</span>
                      <span className="flex items-center gap-1"><BookOpen size={11} /> {course.lessons} lessons</span>
                      <span className="flex items-center gap-1"><Users size={11} /> {(course.students / 1000).toFixed(1)}K</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {selectedCourse && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedCourse(null)} />
              <motion.div
                className="relative w-full max-w-3xl rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden mx-4"
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
              >
                {(() => {
                  const IconComp = courseIcons[selectedCourse.iconKey] || Code
                  return (
                    <div className="h-64 md:h-80 relative flex items-center justify-center bg-gray-50">
                      <IconComp size={80} className="text-gray-200" />
                      <button
                        className="absolute inset-0 flex items-center justify-center"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-800 hover:bg-blue-900 transition-colors">
                          {isPlaying ? (
                            <Pause size={24} fill="white" className="text-white" />
                          ) : (
                            <Play size={24} fill="white" className="text-white ml-1" />
                          )}
                        </div>
                      </button>
                    </div>
                  )
                })()}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">{selectedCourse.title}</h2>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{selectedCourse.lessons} lessons</span>
                        <span>{selectedCourse.duration}</span>
                        <span className="flex items-center gap-1 text-amber-600">
                          <Star size={12} fill="currentColor" />
                          {selectedCourse.rating}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedCourse(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-gray-700">{selectedCourse.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-blue-800"
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedCourse.progress}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>

                  <button className="w-full py-3 rounded-lg text-white font-medium bg-blue-800 hover:bg-blue-900 transition-colors duration-200">
                    {selectedCourse.progress > 0 ? 'Continue Learning' : 'Start Course'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
