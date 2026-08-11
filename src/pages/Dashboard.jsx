import React from "react";
import { Heading, Hspace } from "../components/CustomComponents";
import ClassicalLayout1 from "../components/layouts/classic/layout-1/layout"
import ScrollableModal from "../components/ScrollableModal";
import DashboardHeader from "../components/DashboardHeader";
import ResumeTable from "../components/ResumeTable";

import DeleteModal from "../components/DeleteModal";
import { useDashboard } from "../provider/DashboardProvider";
import Container from "../components/Container";
import { usePagination } from "../provider/paginationProvider";
import Loading from "../components/Loading";
import { Link } from "react-router-dom";
import { useAuth } from "../provider/AuthProvider";




const ResumePreview = React.memo(({ closePreviewModal }) => {
  return (
    <ScrollableModal onClose={closePreviewModal} header={<Heading>Resume Preview</Heading>}>
      <ClassicalLayout1 />
    </ScrollableModal>
  );
});

const Dashboard = () => {

  const {
    isModalShow,
    closePreviewModal,
    isLoading,
    isPreviewShow,
    error } = useDashboard()
  const { user } = useAuth()
  const {
    PaginationButtons,
  } = usePagination()

if(isLoading) {
   return <Loading message="Loading dashboard..." />
  }

  if (!user) {
    return <Container><Hspace /><div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900">Your CV workspace</h1>
      <p className="mt-3 text-slate-600">Sign in to save CVs securely and access them from your dashboard.</p>
      <Link className="mt-6 inline-flex rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white" to="/login?redirectTo=%2Fdashboard">Sign in to continue</Link>
    </div></Container>
  }

  return (
    <Container>
      <Hspace />{/*add vertical space because navbar is fixed nad its content is overlapped with navbar*/}
      {/* toots to add,search and sort resumes */}
      <DashboardHeader />
      {error && <p className="my-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
      {/* resumes table */}
      <ResumeTable />  
      {/* pagination buttons */}
      {/* <Pagination /> */}
      {PaginationButtons}

      {isModalShow && <DeleteModal />} {/*show delete modal on button click based on state*/}
      {/* show preview of resume */}
      {isPreviewShow && <ResumePreview closePreviewModal={closePreviewModal} />}
    </Container>
  );
};

export default Dashboard;
