import {
  fromClientInput,
  fromEmployeeCreate,
  fromLeaveCreate,
  fromProjectAssignmentInput,
  fromProjectInput,
  fromProjectTagInput,
  fromTimeEntryInput,
  fromTimeClockInput,
  leaveDays,
  toBirthdayList,
  toApplicationQuery,
  toAttendance,
  toAuthSession,
  toClient,
  toClientQuery,
  toEmployee,
  toEmployeeQuery,
  toLeaveRequest,
  toPayrollRecord,
  toProject,
  toProjectAssignment,
  toProjectQuery,
  toProjectSummaryReport,
  toProjectTag,
  toTimeEntry,
  toTimeEntryQuery,
  toProjectReportQuery,
} from "../adapters";

describe("API adapters", () => {
  it("maps an employee response and its query params", () => {
    const employee = toEmployee({
      id: "uuid-1",
      employeeNumber: "PH-2026-001",
      firstName: "Amara",
      lastName: "Reyes",
      middleName: null,
      email: "amara@example.com",
      phone: "09175551234",
      gender: "FEMALE",
      civilStatus: "MARRIED",
      nationality: "Filipino",
      addressLine1: "1 Main St",
      city: "Makati",
      hiredAt: "2026-01-15T00:00:00.000Z",
      employmentStatus: "ON_LEAVE",
      departmentId: "dept-1",
      positionId: "pos-1",
      payFrequency: "MONTHLY",
    });

    expect(employee).toMatchObject({
      id: "uuid-1",
      contactNumber: "09175551234",
      address: "1 Main St, Makati",
      dateHired: "2026-01-15",
      employmentStatus: "on_leave",
      employmentType: "Full-time",
    });
    expect(toEmployeeQuery({ status: "active", departmentId: "dept-1" })).toEqual({
      departmentId: "dept-1",
      employmentStatus: "ACTIVE",
    });
  });

  it("maps an enriched client response and uppercase filters", () => {
    const client = toClient({
      id: "5c4b8f0e-0e6a-4f1b-9f6f-6a2c1f0d3a11",
      name: "Acme Corporation",
      companyName: "Acme Holdings Inc.",
      code: "ACME",
      contactName: "Ana Delgado",
      email: "ana.delgado@acme.example",
      phone: "+63 2 8888 0101",
      address: "12 Ayala Ave",
      industry: "Retail",
      description: "Regional account",
      status: "INACTIVE",
      projectCount: 3,
      createdAt: "2026-01-01T08:00:00.000Z",
      updatedAt: "2026-02-01T08:00:00.000Z",
      deletedAt: null,
    });

    expect(client).toMatchObject({
      companyName: "Acme Holdings Inc.",
      description: "Regional account",
      status: "inactive",
      projectCount: 3,
      deletedAt: null,
    });
    expect(toClientQuery({ search: "acme", status: "active" })).toEqual({
      search: "acme",
      status: "ACTIVE",
    });
  });

  it("maps a backend birthday month into frontend recurring fields", () => {
    const list = toBirthdayList({
      month: 11,
      monthName: "November",
      count: 1,
      birthdays: [
        {
          employeeId: "emp-1",
          employeeNumber: "PH-2026-001",
          firstName: "Amara",
          lastName: "Reyes",
          preferredName: null,
          email: "amara@example.com",
          dateOfBirth: "1994-11-24T00:00:00.000Z",
          day: 24,
          department: { id: "dept-1", name: "People" },
          position: { id: "pos-1", title: "Manager" },
        },
      ],
    });

    expect(list.birthdays[0]).toMatchObject({
      month: 11,
      day: 24,
      department: "People",
      position: "Manager",
    });
  });

  it("maps time-clock input and response fields", () => {
    expect(
      fromTimeClockInput({
        location: "12 Eastwood Citywalk, Pasig City",
        photo: "data:image/jpeg;base64,abc",
        confirm: true,
      }),
    ).toEqual({
      location: "12 Eastwood Citywalk, Pasig City",
      photo: "data:image/jpeg;base64,abc",
      confirm: true,
    });

    const record = toAttendance({
      id: "attendance-1",
      employeeId: "emp-1",
      date: "2026-11-24",
      timeIn: "2026-11-24T01:00:00.000Z",
      timeOut: null,
      breakMinutes: 0,
      status: "PRESENT",
      lateMinutes: 0,
      undertimeMinutes: 0,
      overtimeMinutes: 0,
      source: "TIME_CLOCK",
      timeInLocation: "Manila",
      timeOutLocation: null,
      hasTimeInPhoto: true,
      hasTimeOutPhoto: false,
      timeInPhoto: "data:image/jpeg;base64,abc",
      timeOutPhoto: null,
    });

    expect(record).toMatchObject({
      source: "time_clock",
      workLocation: "Manila",
      timeInLocation: "Manila",
      timeOutLocation: null,
      hasTimeInPhoto: true,
      hasTimeOutPhoto: false,
      timeInPhoto: "data:image/jpeg;base64,abc",
      timeOutPhoto: null,
    });
  });

  it("maps frontend employee input to whitelisted API fields", () => {
    const dto = fromEmployeeCreate({
      firstName: "Josefa",
      lastName: "Torres",
      middleName: null,
      dateOfBirth: "1990-02-01",
      gender: "Female",
      civilStatus: "Single",
      nationality: "Filipino",
      contactNumber: "09170000000",
      email: "josefa@example.com",
      address: "2 Second St",
      emergencyContact: { name: "Kin", relationship: "Sister", contactNumber: "1" },
      employmentType: "Full-time",
      departmentId: "dept-1",
      positionId: "pos-1",
      supervisorId: null,
      dateHired: "2026-02-01",
      employmentStatus: "active",
      workLocation: "Cebu",
      salaryGrade: 12,
      education: [],
      skills: [],
      governmentIds: { sss: "1", philhealth: "2", pagibig: "3", tin: "4" },
      documents: [],
    });

    expect(dto).toMatchObject({
      employeeNumber: expect.stringMatching(/^PH-\d{4}-\d{1,6}$/),
      firstName: "Josefa",
      phone: "09170000000",
      addressLine1: "2 Second St",
      city: "Cebu",
      hiredAt: "2026-02-01",
      employmentStatus: "ACTIVE",
    });
    expect(dto).not.toHaveProperty("contactNumber");
    expect(dto).not.toHaveProperty("avatarColor");
  });

  it("converts a leave type label into the backend leaveTypeId and days", () => {
    expect(leaveDays("2026-12-01", "2026-12-03")).toBe(3);
    expect(
      fromLeaveCreate(
        {
          employeeId: "emp-1",
          type: "Sick Leave",
          startDate: "2026-12-01",
          endDate: "2026-12-02",
          reason: "Flu",
        },
        "lt-2",
      ),
    ).toEqual({
      employeeId: "emp-1",
      leaveTypeId: "lt-2",
      startDate: "2026-12-01",
      endDate: "2026-12-02",
      days: 2,
      reason: "Flu",
    });
  });

  it("maps a backend leave request back to the frontend model", () => {
    const request = toLeaveRequest({
      id: "leave-1",
      employeeId: "emp-1",
      leaveType: { id: "lt-1", name: "Vacation Leave" },
      startDate: "2026-12-01T00:00:00.000Z",
      endDate: "2026-12-03T00:00:00.000Z",
      days: "3",
      reason: "Holiday",
      status: "APPROVED",
      approvals: [
        {
          approverId: "emp-5",
          status: "APPROVED",
          actedAt: "2026-11-30T10:00:00.000Z",
        },
      ],
      createdAt: "2026-11-29T08:00:00.000Z",
    });

    expect(request).toMatchObject({
      type: "Vacation Leave",
      days: 3,
      status: "approved",
      approvedBy: "emp-5",
    });
  });

  it("splits payroll earnings and deductions into frontend fields", () => {
    const record = toPayrollRecord({
      id: "pay-1",
      periodId: "period-1",
      employeeId: "emp-1",
      basicSalary: "50000",
      totalEarnings: "52500",
      totalDeductions: "8000",
      netPay: "44500",
      earnings: [
        { code: "ALLOWANCE", amount: "2000" },
        { code: "OVERTIME", amount: "500" },
      ],
      deductions: [
        { code: "SSS", amount: "2000" },
        { code: "TAX", amount: "3000" },
        { code: "PAGIBIG", amount: "100" },
        { code: "PHILHEALTH", amount: "100" },
      ],
      calculatedAt: "2026-11-30T09:00:00.000Z",
    });

    expect(record).toMatchObject({
      basicSalary: 50000,
      allowances: 2000,
      overtimePay: 500,
      taxDeductions: 3000,
      deductions: 5000,
      governmentContributions: { sss: 2000, philhealth: 100, pagibig: 100 },
      netPay: 44500,
    });
  });

  it("renames recruitment query keys to the API's field names", () => {
    expect(
      toApplicationQuery({ jobId: "job-1", stage: "offered", search: "Ana" }),
    ).toEqual({ jobPostingId: "job-1", status: "OFFER" });
  });

  it("maps the /auth/me payload into an auth session and role", () => {
    const session = toAuthSession({
      user: {
        id: "user-1",
        firstName: "Josefa",
        lastName: "Torres",
        email: "josefa@example.com",
        employee: { id: "emp-5" },
      },
      activeCompany: {
        id: "company-1",
        name: "People Hub",
        roleKeys: ["company_admin"],
      },
      roles: ["company_admin"],
    });

    expect(session.authenticated).toBe(true);
    expect(session.user).toMatchObject({
      employeeId: "emp-5",
      role: "admin",
    });
  });

  it("maps finance and admin role keys into frontend roles", () => {
    const session = toAuthSession({
      activeCompany: { roleKeys: ["finance_head", "finance_staff"] },
    });

    expect(session.user?.role).toBe("finance_head");
    expect(session.user?.title).toBe("Finance Head");
  });

  it("maps the HR head role key into the frontend role", () => {
    const session = toAuthSession({
      activeCompany: { roleKeys: ["HR_HEAD"] },
    });

    expect(session.user?.role).toBe("hr_head");
    expect(session.user?.title).toBe("HR Head");
  });

  it("maps client responses and create inputs", () => {
    expect(
      toClient({
        id: "client-1",
        name: "Acme Corp",
        code: "ACME",
        contactName: "Ana Admin",
        email: "ana@acme.example",
        phone: "09175550000",
        address: "Makati City",
        industry: "Retail",
        status: "INACTIVE",
        createdAt: "2026-11-20T00:00:00.000Z",
      }),
    ).toMatchObject({
      id: "client-1",
      status: "inactive",
      createdAt: "2026-11-20",
    });

    expect(
      fromClientInput({
        name: "Acme Corp",
        code: "ACME",
        contactName: "Ana Admin",
        email: "ana@acme.example",
        phone: "09175550000",
        address: "Makati City",
        industry: "Retail",
        status: "active",
      }),
    ).toMatchObject({ code: "ACME", status: "ACTIVE" });
  });

  it("maps project responses, enums, and relation fields", () => {
    const project = toProject({
      id: "project-1",
      clientId: "client-1",
      clientName: "Acme Corp",
      clientCode: "ACME",
      name: "Website Redesign",
      code: "WEBRED",
      description: "Refresh the site",
      status: "ON_HOLD",
      priority: "URGENT",
      startDate: "2026-09-01T00:00:00.000Z",
      endDate: "2026-12-15T00:00:00.000Z",
      budget: "850000",
      billable: true,
      createdById: "user-1",
      createdByName: "Helen Head",
      createdAt: "2026-08-01T09:00:00.000Z",
      updatedAt: "2026-08-02T09:00:00.000Z",
      deletedAt: null,
    });

    expect(project).toMatchObject({
      id: "project-1",
      status: "on_hold",
      priority: "urgent",
      startDate: "2026-09-01",
      endDate: "2026-12-15",
      budget: 850000,
      clientName: "Acme Corp",
      tags: [],
      assignments: [],
    });
    expect(project.deletedAt).toBeNull();
  });

  it("maps nullable project budget and relations", () => {
    const project = toProject({
      id: "project-2",
      budget: null,
      status: "PLANNING",
      priority: "LOW",
      tags: [{ id: "tag-1", name: "Frontend", color: null }],
      assignments: [
        {
          id: "assignment-1",
          employeeId: "emp-1",
          role: "LEAD",
          employeeName: "Ana Reyes",
        },
      ],
    });

    expect(project.budget).toBeNull();
    expect(project.tags[0]).toMatchObject({ name: "Frontend", color: null });
    expect(project.assignments[0]).toMatchObject({ role: "lead", employeeName: "Ana Reyes" });
    expect(toProjectTag({ id: "tag-2", color: "#2563EB" })).toMatchObject({ color: "#2563EB" });
    expect(toProjectAssignment({ role: "REVIEWER" })).toMatchObject({ role: "reviewer" });
  });

  it("maps project create input and query enums to the API", () => {
    expect(
      fromProjectInput({
        clientId: "client-1",
        name: "ERP Rollout",
        code: "erp1",
        description: "Finance rollout",
        status: "planning",
        priority: "high",
        startDate: "2026-11-01",
        endDate: "2027-03-31",
        budget: 1200000,
        billable: false,
      }),
    ).toEqual({
      clientId: "client-1",
      name: "ERP Rollout",
      code: "erp1",
      description: "Finance rollout",
      status: "PLANNING",
      priority: "HIGH",
      startDate: "2026-11-01",
      endDate: "2027-03-31",
      budget: 1200000,
      billable: false,
    });

    expect(toProjectQuery({ status: "on_hold", priority: "urgent", clientId: "client-1" })).toEqual({
      status: "ON_HOLD",
      priority: "URGENT",
      clientId: "client-1",
    });
    expect(toProjectQuery()).toEqual({});
  });

  it("maps tag and assignment inputs to the API", () => {
    expect(fromProjectTagInput({ name: "Frontend" })).toEqual({
      name: "Frontend",
      color: null,
    });
    expect(fromProjectAssignmentInput({ employeeId: "emp-1", role: "lead" })).toEqual({
      employeeId: "emp-1",
      role: "LEAD",
    });
    expect(fromProjectAssignmentInput({ employeeId: "emp-1" })).toEqual({
      employeeId: "emp-1",
    });
  });

  it("maps time entry responses, inputs and query params", () => {
    const entry = toTimeEntry({
      id: "11111111-1111-4111-8111-000000000001",
      companyId: "company-1",
      projectId: "project-1",
      projectName: "Website Redesign",
      projectCode: "WEBRED",
      employeeId: "emp-1",
      employeeNumber: "EMP-001",
      employeeName: "Amara Reyes",
      workDate: "2026-11-16",
      startTime: "2026-11-16T09:00:00.000Z",
      endTime: "2026-11-16T17:00:00.000Z",
      durationMinutes: 480,
      billable: true,
      description: null,
      createdAt: "2026-11-16T18:00:00.000Z",
      updatedAt: "2026-11-16T18:00:00.000Z",
      deletedAt: null,
    });

    expect(entry).toMatchObject({
      id: "11111111-1111-4111-8111-000000000001",
      projectName: "Website Redesign",
      workDate: "2026-11-16",
      durationMinutes: 480,
      billable: true,
      description: null,
      deletedAt: null,
    });

    expect(
      fromTimeEntryInput({
        projectId: "project-1",
        employeeId: "emp-1",
        workDate: "2026-11-16",
        startTime: "2026-11-16T09:00:00.000Z",
        endTime: null,
        durationMinutes: 480,
        billable: false,
        description: "Sprint work",
      }),
    ).toEqual({
      projectId: "project-1",
      employeeId: "emp-1",
      workDate: "2026-11-16",
      startTime: "2026-11-16T09:00:00.000Z",
      endTime: null,
      durationMinutes: 480,
      billable: false,
      description: "Sprint work",
    });
    expect(fromTimeEntryInput({ projectId: "project-2", durationMinutes: 60 })).toEqual({
      projectId: "project-2",
      durationMinutes: 60,
    });

    expect(
      toTimeEntryQuery({
        projectId: "project-1",
        from: "2026-11-01",
        to: "2026-11-30",
        billable: false,
      }),
    ).toEqual({
      projectId: "project-1",
      from: "2026-11-01",
      to: "2026-11-30",
      billable: "false",
    });
  });

  it("maps the backend project summary into frontend report rows", () => {
    const report = toProjectSummaryReport({
      generatedAt: "2026-11-27T10:00:00.000Z",
      filters: { from: "2026-11-01", to: null, billable: true },
      totals: { clients: 1, projects: 1, durationMinutes: 480, billableMinutes: 480 },
      clients: [
        {
          id: "client-1",
          code: "ACME",
          name: "Acme",
          status: "ACTIVE",
          projectCount: 1,
          budget: null,
          durationMinutes: 480,
          billableMinutes: 480,
        },
      ],
      projects: [
        {
          id: "project-1",
          code: "WEBRED",
          name: "Website Redesign",
          clientId: "client-1",
          clientName: "Acme",
          status: "ACTIVE",
          priority: "HIGH",
          startDate: "2026-09-01",
          endDate: null,
          budget: "850000.00",
          billable: true,
          teamSize: 2,
          entryCount: 1,
          durationMinutes: 480,
          billableMinutes: 480,
        },
      ],
    });

    expect(report).toMatchObject({
      generatedAt: "2026-11-27T10:00:00.000Z",
      filters: { from: "2026-11-01", to: null, billable: true },
      totals: { clients: 1, projects: 1, durationMinutes: 480 },
    });
    expect(report.clients[0]).toMatchObject({ status: "active", budget: null });
    expect(report.projects[0]).toMatchObject({
      status: "active",
      priority: "high",
      startDate: "2026-09-01",
      endDate: null,
      budget: 850000,
    });
    expect(toProjectReportQuery({ from: "2026-11-01", billable: false })).toEqual({
      from: "2026-11-01",
      billable: "false",
    });
  });
});
