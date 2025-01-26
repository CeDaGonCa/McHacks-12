from enum import Enum
from typing import List, Type, Dict
import time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


class PatientPhase(Enum):
    REGISTERED = "registered"
    TRIAGED = "triaged"

    # class INVESTIGATIONS_PENDING:
    #     ORDERED = "ordered"
    #     PENDING = "pending"
    #     REPORTED = "reported"

    TREATMENT = "treatment"
    ADMITTED = "admitted"
    DISCHARGED = "discharged"


class TriageCategory(Enum):
    RESUSCITATION = 1
    EMERGENT = 2
    URGENT = 3
    LESS_URGENT = 4
    NON_URGENT = 5


class Patient(BaseModel):
    id: int
    phase: PatientPhase
    triage: TriageCategory

    def __hash__(self):
        return self.id


Patients = {
    # 0: Patient(id=0, phase=PatientPhase.REGISTERED, triage=TriageCategory.RESUSCITATION),
}
PatientsQueue = []  # Priority queue
TimeStamps = {} # Dict[int, time]


@app.get("/")
def index():
    # print("hits the get")
    print(Patients)
    return {"items": PatientsQueue}
    # return {"message": 

@app.get("/patients/{patient_id}")
def query_patient(patient_id: int) -> Patient:
    if patient_id not in Patients:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} does not exist")
    return Patients[patient_id]


@app.get("/patients/")
def get_patients_by_parameters(
        phase: PatientPhase | None = None,
        triage: TriageCategory | None = None,
) -> dict[int, Patient]:
    return {k: v for (k, v) in Patients.items() if
            (v.phase is phase and not None or v.triage is TriageCategory and not None)}


@app.post("/")
def add_item(P: Patient):
    print("add_item")
    if P in Patients.values():
        raise HTTPException(status_code=400, detail=f"Patient {Patient.id} already exists")
    print("add_item 2")
    TimeStamps[P.id] = time.time()
    print("add_item 3")
    PatientsQueue.append(P)
    sortQueue()
    return {"added": P}


@app.delete("/pop/")
def attendPatient() -> dict[str, Patient]:
    if not PatientsQueue:
        raise HTTPException(status_code=401, detail="Patients queue is empty")
    patient = PatientsQueue.pop()
    # if patient.phase is PatientPhase.INVESTIGATIONS_PENDING.PENDING:
    #     patient.phase = PatientPhase.INVESTIGATIONS_PENDING.ORDERED
    #     PatientsQueue.add(patient)
    sortQueue()
    return {"deleted": patient}  # missing the investigation


def sortQueue() -> ():
    tmp = sorted(PatientsQueue, key=lambda x: compare(x))


def compare(x: Patient):
    currentTime = time.time()
    triaVal = x.triage.value
    valX = triaVal * 20 + (
        30 * triaVal if currentTime - TimeStamps.get(x.id) > 60 * 60 else (triaVal * 10) * (currentTime - TimeStamps.get(x.id)) // (60 * 60))  # check the math
    return valX
