// Shared, pure rules for dashboard and all access checks.
export const idOf = (value) => String(value?._id ?? value ?? '');
export const academicOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0)
  || new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0)
  || idOf(a).localeCompare(idOf(b));

export function evaluateCurriculum({ modules, lessons, materials, exams, progress, attempts }) {
  const passed = new Set(attempts.filter(a => a.passed).map(a => idOf(a.examId)));
  const progressByLesson = new Map(progress.map(p => [idOf(p.lessonId), p]));
  return modules.filter(m => m.status === 'ACTIVE').sort(academicOrder).map(module => {
    let precedingComplete = true;
    const rows = lessons.filter(l => l.status === 'ACTIVE' && idOf(l.moduleId) === idOf(module))
      .sort(academicOrder).map(lesson => {
        const p = progressByLesson.get(idOf(lesson));
        const viewed = new Set((p?.materialsViewed ?? []).map(idOf));
        const required = materials.filter(m => idOf(m.lessonId) === idOf(lesson) && m.required !== false);
        const materialsDone = required.every(m => viewed.has(idOf(m)));
        const lessonExams = exams.filter(e => e.status === 'ACTIVE' && !e.moduleId && idOf(e.lessonId) === idOf(lesson));
        const examPassed = lessonExams.length > 0 && lessonExams.every(e => passed.has(idOf(e)));
        const isCompleted = materialsDone && examPassed;
        const status = !precedingComplete ? 'LOCKED' : isCompleted ? 'COMPLETED' : p ? 'IN_PROGRESS' : 'AVAILABLE';
        precedingComplete = precedingComplete && isCompleted;
        return { ...lesson, status, progress: { ...(p ?? {}), materialsViewed: p?.materialsViewed ?? [], examPassed, isCompleted }, materialsDone };
      });
    const allClassesComplete = rows.length > 0 && rows.every(l => l.status === 'COMPLETED');
    const finalExam = exams.filter(e => e.status === 'ACTIVE' && idOf(e.moduleId) === idOf(module)).sort(academicOrder)[0];
    const finalPassed = !!finalExam && passed.has(idOf(finalExam));
    const completed = allClassesComplete && finalPassed;
    return { ...module, lessons: rows,
      status: completed ? 'COMPLETED' : rows.some(l => l.progress.lastAccessedAt || l.status === 'COMPLETED') ? 'IN_PROGRESS' : 'AVAILABLE',
      finalExam: finalExam ? { _id: finalExam._id, title: finalExam.title, passingScorePercent: finalExam.passingScorePercent,
        status: !allClassesComplete ? 'LOCKED' : finalPassed ? 'COMPLETED' : attempts.some(a => idOf(a.examId) === idOf(finalExam)) ? 'IN_PROGRESS' : 'AVAILABLE' } : null,
    };
  });
}
