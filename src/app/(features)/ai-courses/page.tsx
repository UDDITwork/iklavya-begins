'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  Play, Pause, Clock, BookOpen, Award, ChevronRight,
  Star, Users, BarChart3
} from 'lucide-react'
import ParticleField from '@/components/animations/ParticleField'
import GlowingOrb from '@/components/animations/GlowingOrb'

const courses = [
  { id: 1, title: 'Python for Data Science', category: 'Programming', duration: '12h', lessons: 48, rating: 4.8, students: 12400, progress: 65, color: '#3b82f6', image: '🐍' },
  { id: 2, title: 'React & Next.js Mastery', category: 'Web Development', duration: '16h', lessons: 62, rating: 4.9, students: 8900, progress: 30, color: '#8b5cf6', image: '⚛️' },
  { id: 3, title: 'Machine Learning A-Z', category: 'AI/ML', duration: '20h', lessons: 85, rating: 4.7, students: 15600, progress: 0, color: '#10b981', image: '🤖' },
  { id: 4, title: 'SQL & Database Design', category: 'Databases', duration: '8h', lessons: 32, rating: 4.6, students: 9200, progress: 100, color: '#f59e0b', image: '🗄️' },
  { id: 5, title: 'System Design Interview', category: 'Interview Prep', duration: '10h', lessons: 40, rating: 4.9, students: 18000, progress: 15, color: '#ec4899', image: '🏗️' },
  { id: 6, title: 'Communication Skills', category: 'Soft Skills', duration: '6h', lessons: 24, rating: 4.5, students: 6800, progress: 0, color: '#06b6d4', image: '🗣️' },
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
    <div className="min-h-screen bg-[#030014] relative overflow-hidden">
      <ParticleField particleCount={40} className="opacity-20" />
      <GlowingOrb size={400} color="rgba(139,92,246,0.06)" x="80%" y="20%" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">AI Video Courses</h1>
          <p className="text-white/40">Learn from AI-powered interactive courses</p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/[0.03] text-white/40 border border-white/5 hover:text-white/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Course Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          layout
        >
          <AnimatePresence>
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group rounded-2xl overflow-hidden glass cursor-pointer"
                onClick={() => setSelectedCourse(course)}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                {/* Thumbnail */}
                <div
                  className="h-44 relative flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${course.color}10, ${course.color}05)`,
                  }}
                >
                  <span className="text-6xl">{course.image}</span>

                  {/* Play overlay */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black/40
                      opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <motion.div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: course.color }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Play size={20} fill="white" className="text-white ml-0.5" />
                    </motion.div>
                  </motion.div>

                  {/* Progress indicator */}
                  {course.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                      <div
                        className="h-full rounded-r"
                        style={{ width: `${course.progress}%`, background: course.color }}
                      />
                    </div>
                  )}

                  {course.progress === 100 && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold">
                      COMPLETED
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: `${course.color}15`, color: course.color }}
                    >
                      {course.category}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-yellow-400">
                      <Star size={10} fill="currentColor" />
                      {course.rating}
                    </div>
                  </div>
                  <h3 className="font-semibold text-white/90 mb-2 group-hover:text-white transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-white/30">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={11} /> {course.lessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {(course.students / 1000).toFixed(1)}K
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Course Detail Modal */}
        <AnimatePresence>
          {selectedCourse && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setSelectedCourse(null)}
              />
              <motion.div
                className="relative w-full max-w-3xl rounded-2xl bg-[#0a0a1a] border border-white/10 overflow-hidden"
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
              >
                {/* Video Player Area */}
                <div
                  className="h-64 md:h-80 relative flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${selectedCourse.color}15, #030014)` }}
                >
                  <span className="text-8xl">{selectedCourse.image}</span>
                  <motion.button
                    className="absolute inset-0 flex items-center justify-center"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    <motion.div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: selectedCourse.color }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isPlaying ? (
                        <Pause size={24} fill="white" className="text-white" />
                      ) : (
                        <Play size={24} fill="white" className="text-white ml-1" />
                      )}
                    </motion.div>
                  </motion.button>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">{selectedCourse.title}</h2>
                      <div className="flex items-center gap-3 text-sm text-white/40">
                        <span>{selectedCourse.lessons} lessons</span>
                        <span>{selectedCourse.duration}</span>
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Star size={12} fill="currentColor" />
                          {selectedCourse.rating}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCourse(null)}
                      className="text-white/40 hover:text-white text-xl"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/40">Progress</span>
                      <span className="text-white/60">{selectedCourse.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: selectedCourse.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedCourse.progress}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>

                  <button
                    className="w-full py-3 rounded-xl text-white font-medium
                      bg-gradient-to-r from-blue-500 to-purple-500
                      hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-shadow"
                  >
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
