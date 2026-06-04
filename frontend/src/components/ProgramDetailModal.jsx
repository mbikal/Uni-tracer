import { X, GraduationCap, Target, Calendar, CheckCircle, DollarSign, FileText, Award, Clock, Bot, Brain, ExternalLink, BookOpen, Lightbulb } from 'lucide-react'

export function ProgramDetailModal({ program, onClose }) {
  if (!program) return null

  const getFieldIcon = () => {
    if (program.field === 'robotics') return <Bot className="w-5 h-5" />
    if (program.field === 'ai') return <Brain className="w-5 h-5" />
    return <Bot className="w-5 h-5" />
  }

  const getFieldLabel = () => {
    if (program.field === 'robotics') return 'Robotics'
    if (program.field === 'ai') return 'AI'
    return 'Robotics & AI'
  }

  const formatTuition = (tuition) => {
    if (!tuition && tuition !== 0) return 'Tuition info unavailable'
    if (tuition === 0) return 'Free tuition'
    return `$${tuition.toLocaleString()}/year`
  }

  // Generate acceptance roadmap based on program data
  const generateRoadmap = () => {
    const steps = [
      {
        phase: 'Preparation',
        timeline: '6-12 months before deadline',
        items: [
          'Research program requirements thoroughly',
          'Prepare academic transcripts',
          'Secure recommendation letters (2-3)',
          'Draft statement of purpose',
          'Prepare CV/Resume highlighting relevant projects',
          program.language?.includes('English') ? 'Take TOEFL/IELTS if needed' : 'Language proficiency test if required'
        ]
      },
      {
        phase: 'Application',
        timeline: '3-6 months before deadline',
        items: [
          'Complete online application form',
          'Pay application fee (if applicable)',
          'Submit all required documents',
          'Write program-specific essays',
          'Apply for scholarships simultaneously'
        ]
      },
      {
        phase: 'Post-Application',
        timeline: 'After submission',
        items: [
          'Track application status',
          'Prepare for interviews (if required)',
          'Respond to additional document requests',
          'Wait for decision (typically 6-12 weeks)',
          'Accept offer and pay deposit if admitted'
        ]
      },
      {
        phase: 'Pre-Departure',
        timeline: '3-6 months before intake',
        items: [
          'Apply for student visa',
          'Arrange accommodation',
          'Book flights',
          'Attend pre-departure orientation',
          'Connect with current students/alumni'
        ]
      }
    ]

    return steps
  }

  // Generate scholarship opportunities
  const generateScholarships = () => {
    const baseScholarships = [
      {
        name: `${program.university} Merit Scholarship`,
        amount: '20-100% tuition coverage',
        criteria: 'Academic excellence, strong profile',
        deadline: 'Same as program deadline',
        link: program.url
      },
      {
        name: `${program.country} Government Scholarship`,
        amount: 'Full or partial funding',
        criteria: 'International students, academic merit',
        deadline: 'Usually 6-12 months before intake',
        link: getGovernmentScholarshipLink(program.country)
      },
      {
        name: 'Erasmus+ Master\'s Loan',
        amount: 'Up to €12,000/year',
        criteria: 'EU students, accepted to program',
        deadline: 'Ongoing',
        link: 'https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-masters-loans'
      }
    ]

    // Add field-specific scholarships
    if (program.field === 'robotics' || program.field === 'both') {
      baseScholarships.push({
        name: 'IEEE Robotics & Automation Society Scholarship',
        amount: '$2,000-5,000',
        criteria: 'Robotics focus, IEEE membership',
        deadline: 'March 31 annually',
        link: 'https://www.ieee-ras.org/'
      })
    }

    if (program.field === 'ai' || program.field === 'both') {
      baseScholarships.push({
        name: 'AI4ALL Scholarship Program',
        amount: 'Variable',
        criteria: 'AI/ML focus, underrepresented groups',
        deadline: 'Rolling basis',
        link: 'https://ai-4-all.org/'
      })
    }

    return baseScholarships
  }


  const roadmap = generateRoadmap()
  const scholarships = generateScholarships()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-navy-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-navy-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-6 border-b border-navy-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{program.country === 'USA' ? '🇺🇸' : program.country === 'UK' ? '🇬🇧' : program.country === 'Germany' ? '🇩🇪' : program.country === 'Spain' ? '🇪🇸' : program.country === 'Austria' ? '🇦🇹' : program.country === 'Italy' ? '🇮🇹' : program.country === 'Sweden' ? '🇸🇪' : '🌍'}</span>
                <span className="px-3 py-1 bg-cyan-500/20 rounded-full text-sm font-medium text-cyan-400">
                  {program.country}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-navy-700 rounded-full text-sm text-warm-gray">
                  {getFieldIcon()}
                  {getFieldLabel()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-warm-white mb-2">
                {program.program_name}
              </h2>
              <p className="text-lg text-cyan-400">
                {program.university}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-warm-gray" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[70vh]">
          <div className="p-6 space-y-8">
            
            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                <DollarSign className="w-5 h-5 text-green-400 mb-2" />
                <p className="text-xs text-warm-gray">Tuition</p>
                <p className={`font-semibold ${program.tuition_usd === 0 ? 'text-green-400' : 'text-warm-white'}`}>
                  {formatTuition(program.tuition_usd)}
                </p>
              </div>
              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                <Clock className="w-5 h-5 text-cyan-400 mb-2" />
                <p className="text-xs text-warm-gray">Duration</p>
                <p className="font-semibold text-warm-white">
                  {program.duration_months ? `${program.duration_months} months` : '24 months'}
                </p>
              </div>
              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                <Calendar className="w-5 h-5 text-orange-400 mb-2" />
                <p className="text-xs text-warm-gray">Deadline</p>
                <p className="font-semibold text-warm-white">
                  {program.application_deadline || 'Check website'}
                </p>
              </div>
              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                <Award className="w-5 h-5 text-purple-400 mb-2" />
                <p className="text-xs text-warm-gray">Scholarship</p>
                <p className="font-semibold text-warm-white">
                  {program.scholarship_available ? 'Available ✅' : 'Check with uni'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-navy-800/50 p-4 rounded-xl border border-navy-700">
              <p className="text-warm-gray leading-relaxed">
                {program.description_snippet || 'No description available'}
              </p>
            </div>

            {/* Acceptance Roadmap */}
            <div>
              <h3 className="text-xl font-bold text-warm-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-cyan-400" />
                Acceptance Roadmap
              </h3>
              <div className="space-y-4">
                {roadmap.map((step, index) => (
                  <div key={index} className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-warm-white">{step.phase}</h4>
                        <p className="text-xs text-cyan-400">{step.timeline}</p>
                      </div>
                    </div>
                    <ul className="space-y-2 ml-11">
                      {step.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-warm-gray">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Scholarships Section */}
            <div>
              <h3 className="text-xl font-bold text-warm-white mb-4 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-green-400" />
                Scholarship Opportunities
              </h3>
              <div className="grid gap-4">
                {scholarships.map((scholarship, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 p-4 rounded-xl border border-green-500/20">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-warm-white">{scholarship.name}</h4>
                      <span className="px-2 py-1 bg-green-500/20 rounded text-xs text-green-400 font-medium">
                        {scholarship.amount}
                      </span>
                    </div>
                    <p className="text-sm text-warm-gray mb-2">
                      <span className="text-cyan-400">Criteria:</span> {scholarship.criteria}
                    </p>
                    <p className="text-xs text-navy-600 mb-3">
                      Deadline: {scholarship.deadline}
                    </p>
                    <a
                      href={scholarship.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Learn more <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                <h4 className="font-semibold text-warm-white mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Entry Requirements
                </h4>
                <p className="text-sm text-warm-gray">
                  {program.entry_requirements || 'Engineering or Computer Science background, programming experience, and relevant academic qualifications. Check university website for specific requirements.'}
                </p>
              </div>
              <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                <h4 className="font-semibold text-warm-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  Program Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {program.tags?.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-navy-700 rounded text-xs text-warm-gray">
                      {tag}
                    </span>
                  )) || <span className="text-sm text-warm-gray">Robotics, AI, Masters</span>}
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 rounded-xl border border-yellow-500/20">
              <h4 className="font-semibold text-warm-white mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Pro Tips for Success
              </h4>
              <ul className="space-y-2 text-sm text-warm-gray">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  Start preparing 6-12 months before the deadline
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  Contact professors whose research aligns with your interests
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  Highlight robotics/AI projects in your portfolio
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  Apply to multiple scholarships simultaneously
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-navy-700 bg-navy-800/50 flex justify-between items-center">
          <a
            href={program.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-navy-900 rounded-xl font-semibold transition-colors"
          >
            Apply Now
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-navy-700 hover:bg-navy-600 text-warm-white rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProgramDetailModal
