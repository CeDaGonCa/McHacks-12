import queue
from enum import Enum
from functools import cmp_to_key
from typing import List, Type, Dict
import time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


class PatientPhase(Enum):
    REGISTERED = "registered"
    TRIAGED = "triaged"

    class INVESTIGATIONS_PENDING:
        ORDERED = "ordered"
        PENDING = "pending"
        REPORTED = "reported"

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


Patients = dict[int, Patient]
PatientsQueue = []  # Priority queue
TimeStamps = Dict[int, time]


@app.get("/")
def index() -> []:
    return Patients


@app.get("/patients/{patient_id}")
def query_patient(patient_id: int) -> Type[dict[int, Patient]]:
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
def add_item(Patient: Patient) -> dict[str, Patient]:
    if Patient in Patients:
        raise HTTPException(status_code=400, detail=f"Patient {Patient.id} already exists")
    TimeStamps[Patient.id] = time.time()
    PatientsQueue.add(Patient)  # later
    sortQueue()
    return {"added": Patient}


@app.delete("/pop/")
def attendPatient() -> dict[str, Patient]:
    if not PatientsQueue:
        raise HTTPException(status_code=401, detail="Patients queue is empty")
    patient = PatientsQueue.pop()
    sortQueue()
    return {"deleted": patient}
def sortQueue() -> ():
    tmp = sorted(PatientsQueue, key= lambda x: compare(x))


def compare(x):
    currentTime = time.time()
    triaVal = x.TriageCategory.value
    valX = triaVal*20 + (30*triaVal if currentTime >60*60 else (triaVal*10) * (currentTime)//(60*60))# check the math
    return valX