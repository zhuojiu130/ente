import { Stack, Typography } from '@mui/material';
import { GalleryContext } from 'pages/gallery';
import { AppContext } from 'pages/_app';
import React, { useContext, useState } from 'react';
import { t } from 'i18next';
import {
    createShareableURL,
    updateShareableURL,
} from 'services/collectionService';
import { Collection, PublicURL, UpdatePublicURL } from 'types/collection';
import { handleSharingErrors } from 'utils/error/ui';
import { EnteMenuItem } from 'components/Menu/menuItem';
import PublicIcon from '@mui/icons-material/Public';
interface Iprops {
    publicShareProp;
    collection: Collection;
    setPublicShareProp: (value: PublicURL) => void;
    setIsFirstShareProp: (value: boolean) => void;
}
import LinkIcon from '@mui/icons-material/Link';
import { EnteMenuItemGroup } from 'components/Menu/menuItemGroup';

export default function BeforeShare({
    collection,
    setPublicShareProp,
    setIsFirstShareProp,
}: Iprops) {
    const appContext = useContext(AppContext);
    const galleryContext = useContext(GalleryContext);
    const [sharableLinkError, setSharableLinkError] = useState(null);

    const createSharableURLHelper = async () => {
        try {
            appContext.startLoading();
            const publicURL = await createShareableURL(collection);
            setPublicShareProp(publicURL);
            setIsFirstShareProp(true);
            await galleryContext.syncWithRemote(false, true);
        } catch (e) {
            const errorMessage = handleSharingErrors(e);
            setSharableLinkError(errorMessage);
        } finally {
            appContext.finishLoading();
        }
    };

    const updatePublicShareURLHelper = async (req: UpdatePublicURL) => {
        try {
            galleryContext.setBlockingLoad(true);
            const response = await updateShareableURL(req);
            setPublicShareProp(response);
        } catch (e) {
            const errorMessage = handleSharingErrors(e);
            setSharableLinkError(errorMessage);
        } finally {
            galleryContext.setBlockingLoad(false);
        }
    };
    const handleCollectionPublicSharing = () => {
        setSharableLinkError(null);
        createSharableURLHelper();
    };
    const handleCollecPhotosPublicSharing = async () => {
        setSharableLinkError(null);
        await createSharableURLHelper();
        await updatePublicShareURLHelper({
            collectionID: collection.id,
            enableCollect: true,
        });
    };
    return (
        <Stack>
            <Typography color="text.secondary" variant="body2" padding={1}>
                <PublicIcon style={{ fontSize: 17, marginRight: 8 }} />
                {t('LINK_SHARE_TITLE')}
            </Typography>
            <EnteMenuItemGroup>
                <EnteMenuItem
                    startIcon={<LinkIcon />}
                    color="primary"
                    onClick={handleCollectionPublicSharing}>
                    {t('CREATE_PUBLIC_SHARING')}
                </EnteMenuItem>
                <EnteMenuItem
                    startIcon={<LinkIcon />}
                    color="primary"
                    onClick={handleCollecPhotosPublicSharing}>
                    {t('COLLECT_PHOTOS')}
                </EnteMenuItem>
            </EnteMenuItemGroup>
            {sharableLinkError && (
                <Typography
                    textAlign={'center'}
                    variant="body2"
                    sx={{
                        color: (theme) => theme.palette.danger.main,
                        mt: 0.5,
                    }}>
                    {sharableLinkError}
                </Typography>
            )}
        </Stack>
    );
}
