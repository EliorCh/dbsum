/* practice assignment 2, question 3 — relational algebra on the university sample data */
const UNI={
  Student:RA.R('Student',['student-id','name','city'],[[101,'Noa','Haifa'],[102,'Omer','Tel-Aviv'],[103,'Lia','Haifa'],[104,'Ben','Jerusalem'],[105,'Tal','Tel-Aviv'],[106,'Dor','Eilat']]),
  Course:RA.R('Course',['course-id','title','dept','credits'],[['C1','Databases','CS',4],['C2','Algorithms','CS',5],['C3','Statistics','MATH',4],['C4','Calculus','MATH',5],['C5','Networks','CS',3]]),
  Takes:RA.R('Takes',['student-id','course-id','semester','grade'],[[101,'C1','2025A',92],[101,'C2','2025A',85],[101,'C5','2025B',78],[102,'C1','2025A',64],[102,'C3','2025B',88],[103,'C1','2025B',95],[103,'C2','2025B',90],[103,'C5','2025B',99],[103,'C4','2025A',70],[104,'C3','2025A',55],[104,'C4','2025A',61],[105,'C2','2025A',72],[105,'C1','2025B',58]]),
  Teaches:RA.R('Teaches',['lecturer-name','course-id','semester'],[['Cohen','C1','2025A'],['Levi','C1','2025B'],['Cohen','C2','2025A'],['Cohen','C2','2025B'],['Mizrahi','C3','2025A'],['Mizrahi','C3','2025B'],['Peretz','C4','2025A'],['Levi','C5','2025B']])
};
(function(){
  const {sel,proj,times,rho,diff,join,div}=RA,U=UNI;
  const cs=sel(U.Course,t=>t.dept==='CS');
  Object.assign(CHECK,{
    m3a:()=>proj(sel(U.Student,t=>t.city==='Haifa'),['name']),
    m3b:()=>proj(join(join(U.Student,U.Takes),cs),['name','title']),
    m3c:()=>proj(sel(join(join(U.Student,U.Takes),U.Course),t=>t.title==='Databases'&&t.grade>90),['name']),
    m3d:()=>proj(join(join(U.Student,U.Takes),sel(U.Teaches,t=>t['lecturer-name']==='Cohen')),['name']),
    m3e:()=>{const o=rho(proj(sel(U.Student,t=>t.name==='Omer'),['city']),'o');
      return proj(sel(times(U.Student,o),t=>t['Student.city']===t['o.city']&&t['Student.name']!=='Omer'),['Student.name']);},
    m3f:()=>{const math=proj(join(U.Takes,sel(U.Course,t=>t.dept==='MATH')),['student-id']);
      return proj(join(diff(proj(U.Student,['student-id']),math),U.Student),['name']);},
    m3g:()=>{const db=proj(join(U.Takes,sel(U.Course,t=>t.title==='Databases')),['student-id','grade']);
      const st=rho(proj(join(U.Takes,sel(U.Course,t=>t.title==='Statistics')),['grade']),'s');
      const db2=RA.R('d',db.attrs,db.rows,db.prov);
      const notTop=proj(sel(times(db2,st),t=>t['d.grade']<=t['s.grade']),['d.student-id']);
      return proj(join(diff(proj(db,['student-id']),notTop),U.Student),['name']);},
    m3h:()=>proj(join(div(proj(U.Takes,['student-id','course-id']),proj(cs,['course-id'])),U.Student),['name'])
  });
})();
