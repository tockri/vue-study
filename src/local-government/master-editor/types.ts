export type Group = {
  id: string
  name: string
  localGovernmentName: string
  organizationId: string
}

type OrganizationCheckFail = {
  organizationId: string
  available: false
  message: string
}

type OrganizationCheckSuccess = {
  organizationId: string
  available: true
  organizationName: string
}

export type OrganizationCheckResult = OrganizationCheckFail | OrganizationCheckSuccess

export interface GroupCheckService {
  checkOrganizationId(organizationId: string): Promise<OrganizationCheckResult>
}
