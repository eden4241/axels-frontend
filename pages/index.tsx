import { NextPage } from 'next';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import BrandsSection from '../libs/components/homepage/BrandSection';
import TrendProducts from '../libs/components/homepage/TrendProducts';
import IconWall from '../libs/components/homepage/IconWall';
import TopStores from '../libs/components/homepage/TopSellers';
import Shipping from '../libs/components/homepage/Shipping';
import CategoryProducts from '../libs/components/homepage/CategoryProducts';
import Advertisement from '../libs/components/homepage/Advertisement';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import DualNavigationCards from '../libs/components/homepage/DualCard';

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

const Home: NextPage<{ isMobile: boolean }> = (props) => {
  const device = typeof window !== 'undefined' ? useDeviceDetect() : false;

  const isMobile = device === 'mobile';

  return (
    <Stack className="home-page">
      {isMobile ? (
        <>
          <BrandsSection />
          <TrendProducts />
          <IconWall />
          <TopStores />
          <Shipping />
        </>
      ) : (
        <>
          <BrandsSection />
          <TrendProducts />
          <Advertisement />
          <IconWall />
          <CategoryProducts />
          <TopStores />
          <Shipping />
          <CommunityBoards />
          <DualNavigationCards />
        </>
      )}
    </Stack>
  );
};

export default withLayoutMain(Home);
