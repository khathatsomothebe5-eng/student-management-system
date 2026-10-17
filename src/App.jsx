
import { useEffect, useState } from 'react'
import './App.css'

const emptyForm = {
  id: '',
  name: '',
  age: '',
  email: '',
  course: '',
  status: 'true'
}

const initialStudents = [
  {
    id: 'ST001',
    name: 'Lerato Mokoena',
    age: 20,
    email: 'lerato@example.com',
    course: 'Business IT',
    status: true
  },
  {
    id: 'ST002',
    name: 'Thabo Ndlovu',
    age: 22,
    email: 'thabo@example.com',
    course: 'Accounting',
    status: true
  }
]

function App() {
  const [students, setStudents] = useState(() => {
    try {
      const savedStudents = localStorage.getItem('students')

      if (savedStudents !== null) {
        const parsedStudents = JSON.parse(savedStudents)

        if (Array.isArray(parsedStudents)) {
          return parsedStudents
        }
      }
    } catch (error) {
      console.error('Could not load students:', error)
    }

    return initialStudents
  })

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Save records whenever the student list changes.
  useEffect(() => {
    try {
      localStorage.setItem('students', JSON.stringify(students))
    } catch (error) {
      console.error('Could not save students:', error)
    }
  }, [students])

  function handleChange(event) {
    const { name, value } = event.target

    setForm(previousForm => ({
      ...previousForm,
      [name]: value
    }))
  }

  function openAddModal() {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
    setShowModal(true)
  }

  function openEditModal(student) {
    setForm({
      id: student.id,
      name: student.name,
      age: String(student.age),
      email: student.email,
      course: student.course,
      status: String(student.status)
    })

    setEditingId(student.id)
    setError('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setForm(emptyForm)
    setEditingId(null)
    setError('')
  }

  function handleSaveStudent(event) {
    event.preventDefault()
    setError('')

    if (
      !form.id.trim() ||
      !form.name.trim() ||
      !form.age ||
      !form.email.trim() ||
      !form.course.trim()
    ) {
      setError('Please fill in all required fields.')
      return
    }

    const age = Number(form.age)

    if (!Number.isInteger(age) || age < 1 || age > 120) {
      setError('Enter a valid age between 1 and 120.')
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(form.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    const cleanId = form.id.trim()

    const duplicateId = students.some(
      student =>
        student.id.toLowerCase() === cleanId.toLowerCase() &&
        student.id !== editingId
    )

    if (duplicateId) {
      setError('This student ID already exists.')
      return
    }

    const studentData = {
      id: cleanId,
      name: form.name.trim(),
      age,
      email: form.email.trim(),
      course: form.course.trim(),
      status: form.status === 'true'
    }

    if (editingId !== null) {
      setStudents(previousStudents =>
        previousStudents.map(student =>
          student.id === editingId ? studentData : student
        )
      )
    } else {
      setStudents(previousStudents => [
        ...previousStudents,
        studentData
      ])
    }

    closeModal()
  }

  function handleDeleteStudent() {
    if (!studentToDelete) return

    setStudents(previousStudents =>
      previousStudents.filter(
        student => student.id !== studentToDelete.id
      )
    )

    setStudentToDelete(null)
  }

  const filteredStudents = students.filter(student => {
    const search = searchTerm.toLowerCase().trim()

    const matchesSearch =
      student.id.toLowerCase().includes(search) ||
      student.name.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search) ||
      student.course.toLowerCase().includes(search)

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'enrolled' && student.status) ||
      (statusFilter === 'not-enrolled' && !student.status)

    return matchesSearch && matchesStatus
  })

  const enrolledCount = students.filter(
    student => student.status
  ).length

  return (
    <div className="app">
      <header className="header">
        <h1>Student Management System</h1>
        <p>Manage student records in one place</p>
      </header>

      <main className="container">
        <div className="dashboard">
          <div className="summary-card">
            <h3>Total Students</h3>
            <p>{students.length}</p>
          </div>

          <div className="summary-card">
            <h3>Enrolled Students</h3>
            <p>{enrolledCount}</p>
          </div>

          <div className="summary-card">
            <h3>Not Enrolled</h3>
            <p>{students.length - enrolledCount}</p>
          </div>
        </div>

        <section className="student-section">
          <div className="section-heading">
            <h2>Student Records</h2>

            <button
              className="add-button"
              onClick={openAddModal}
            >
              + Add Student
            </button>
          </div>

          <div className="filters">
            <input
              type="search"
              aria-label="Search students"
              placeholder="Search by ID, name, email or course..."
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />

            <select
              aria-label="Filter by enrollment status"
              value={statusFilter}
              onChange={event => setStatusFilter(event.target.value)}
            >
              <option value="all">All Students</option>
              <option value="enrolled">Enrolled</option>
              <option value="not-enrolled">Not Enrolled</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Age</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.age}</td>
                    <td>{student.email}</td>
                    <td>{student.course}</td>
                    <td>
                      <span
                        className={
                          student.status
                            ? 'status-badge enrolled'
                            : 'status-badge not-enrolled'
                        }
                      >
                        {student.status
                          ? 'Enrolled'
                          : 'Not Enrolled'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => openEditModal(student)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => setStudentToDelete(student)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="record-count">
            Showing {filteredStudents.length} of {students.length} students
          </p>
        </section>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-modal-title"
          >
            <h2 id="student-modal-title">
              {editingId !== null ? 'Edit Student' : 'Add New Student'}
            </h2>

            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}

            <form onSubmit={handleSaveStudent}>
              <label htmlFor="id">Student ID</label>
              <input
                id="id"
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="e.g. ST003"
                required
              />

              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />

              <label htmlFor="age">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                min="1"
                max="120"
                value={form.age}
                onChange={handleChange}
                placeholder="Enter age"
                required
              />

              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@example.com"
                required
              />

              <label htmlFor="course">Course of Study</label>
              <input
                id="course"
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder="e.g. Business IT"
                required
              />

              <label htmlFor="status">Enrollment Status</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="true">Enrolled</option>
                <option value="false">Not Enrolled</option>
              </select>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className="add-button">
                  {editingId !== null ? 'Save Changes' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {studentToDelete && (
        <div className="modal-overlay">
          <div
            className="modal delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <h2 id="delete-title">Delete Student?</h2>

            <p>
              Are you sure you want to delete{' '}
              <strong>{studentToDelete.name}</strong>?
              This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setStudentToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-button"
                onClick={handleDeleteStudent}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
